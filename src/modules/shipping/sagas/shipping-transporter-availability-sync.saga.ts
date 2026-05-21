import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';
import { UpdateShippingCommand } from '../commands/exporting.command';
import { TransporterAvailabilityUpdatedEvent } from '../events/transporteravailabilityupdated.event';
import { SagaShippingFailedEvent } from '../events/shipping-failed.event';
import { ShippingQueryRepository } from '../repositories/shippingquery.repository';
import { Shipping } from '../entities/shipping.entity';

@Injectable()
export class ShippingTransporterAvailabilitySyncSaga {
  private readonly logger = new Logger(ShippingTransporterAvailabilitySyncSaga.name);
  private readonly nonTerminalStatuses = new Set(['PENDING', 'READY_FOR_ASSIGNMENT', 'ASSIGNED', 'TRANSPORTER_REASSIGNMENT_REQUIRED']);
  private readonly unavailableStatuses = new Set(['UNAVAILABLE', 'OFFLINE', 'SUSPENDED', 'BLOCKED']);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly shippingQueryRepository: ShippingQueryRepository,
  ) {}

  @Saga()
  onTransporterAvailabilityUpdated = ($events: Observable<TransporterAvailabilityUpdatedEvent>) => {
    return $events.pipe(
      ofType(TransporterAvailabilityUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga shipping-transporter-availability-sync recibió TransporterAvailabilityUpdated: ${event.aggregateId}`);
        void this.handleTransporterAvailabilityUpdated(event);
      }),
      map(() => null)
    );
  };

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance().registerClient(ShippingTransporterAvailabilitySyncSaga.name).get(ShippingTransporterAvailabilitySyncSaga.name),
  })
  private async handleTransporterAvailabilityUpdated(event: TransporterAvailabilityUpdatedEvent): Promise<void> {
    try {
      const availabilityStatus = String(event?.payload?.instance?.availabilityStatus ?? '').trim().toUpperCase();
      const transporterId = String(event?.aggregateId ?? '').trim();

      if (!transporterId || !availabilityStatus) {
        return;
      }

      const [shipments] = await this.shippingQueryRepository.findAndCount({ transporterId });
      if (!shipments.length) {
        return;
      }

      for (const shipment of shipments) {
        const patch = this.buildUpdatePatch(shipment, availabilityStatus, event);
        if (!patch) {
          continue;
        }

        await this.commandBus.execute(
          new UpdateShippingCommand(
            {
              id: shipment.id,
              transporterId: shipment.transporterId,
              ...patch,
            },
            this.buildCommandMetadata(event),
          ),
        );
      }
    } catch (error: any) {
      this.logger.error(`Error en shipping-transporter-availability-sync: ${error.message}`);
      this.eventBus.publish(new SagaShippingFailedEvent(error, event));
    }
  }

  private buildUpdatePatch(
    shipment: Shipping,
    availabilityStatus: string,
    event: TransporterAvailabilityUpdatedEvent,
  ): Record<string, any> | null {
    const currentStatus = String((shipment as any)?.status ?? '').trim().toUpperCase();
    const currentExceptionCode = String((shipment as any)?.exceptionCode ?? '').trim().toUpperCase();
    const metadata = {
      ...((shipment as any)?.metadata ?? {}),
      transporterAvailabilityStatus: availabilityStatus,
      transporterAvailabilityUpdatedAt: new Date().toISOString(),
      transporterAvailabilityCorrelationId: event?.payload?.metadata?.correlationId,
      transporterAvailabilitySourceService: event?.payload?.metadata?.sourceService ?? 'transporter-service',
    };

    if (this.unavailableStatuses.has(availabilityStatus) && this.nonTerminalStatuses.has(currentStatus)) {
      return {
        status: 'TRANSPORTER_REASSIGNMENT_REQUIRED',
        exceptionCode: 'TRANSPORTER_UNAVAILABLE',
        metadata: {
          ...metadata,
          transporterReassignmentRequired: true,
        },
      };
    }

    if (
      availabilityStatus === 'AVAILABLE' &&
      currentStatus === 'TRANSPORTER_REASSIGNMENT_REQUIRED' &&
      currentExceptionCode === 'TRANSPORTER_UNAVAILABLE'
    ) {
      return {
        status: 'READY_FOR_ASSIGNMENT',
        exceptionCode: '',
        metadata: {
          ...metadata,
          transporterReassignmentRequired: false,
        },
      };
    }

    return null;
  }

  private buildCommandMetadata(event: TransporterAvailabilityUpdatedEvent) {
    const sourceMetadata = event?.payload?.metadata ?? {};
    return {
      instance: event?.payload?.instance ?? {},
      metadata: {
        ...sourceMetadata,
        correlationId: sourceMetadata?.correlationId ?? event?.aggregateId,
        causationId: sourceMetadata?.eventId ?? sourceMetadata?.correlationId ?? event?.aggregateId,
        saga: 'shipping-transporter-availability-sync',
      },
    };
  }
}