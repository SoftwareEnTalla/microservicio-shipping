import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';
import {
  DispatchReadyEvent,
} from '../events/exporting.event';
import {
  SagaShippingFailedEvent
} from '../events/shipping-failed.event';
import {
  CreateShippingCommand,
} from '../commands/exporting.command';

@Injectable()
export class ShippingDispatchReadySyncSaga {
  private readonly logger = new Logger(ShippingDispatchReadySyncSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Cuando fulfillment deja un despacho listo, se crea la base operativa del shipment.

  @Saga()
  onDispatchReady = ($events: Observable<DispatchReadyEvent>) => {
    return $events.pipe(
      ofType(DispatchReadyEvent),
      tap(event => {
        this.logger.log(`Saga shipping-dispatch-ready-sync recibió DispatchReady: ${event.aggregateId}`);
        void this.handleDispatchReady(event);
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
    client: LoggerClient.getInstance().registerClient(ShippingDispatchReadySyncSaga.name).get(ShippingDispatchReadySyncSaga.name),
  })
  private async handleDispatchReady(event: DispatchReadyEvent): Promise<void> {
    const correlationId = this.resolveCorrelationId(event);
    try {
      await this.executeDispatch1(event, correlationId);
    } catch (error: any) {
      await this.runCompensations(event, correlationId, error);
      this.handleSagaError(error, event);
    }
  }

  private resolveCorrelationId(event: any): string {
    const correlationCandidate = this.resolveValue(event, 'payload.instance.orderId');
    if (correlationCandidate !== undefined && correlationCandidate !== null && String(correlationCandidate).trim() !== '') {
      return String(correlationCandidate);
    }
    return String(event?.payload?.metadata?.correlationId ?? event?.aggregateId ?? 'unknown-correlation');
  }

  private buildCommandMetadata(event: any, correlationId: string) {
    const sourceMetadata = event?.payload?.metadata ?? {};
    return {
      ...sourceMetadata,
      correlationId,
      causationId: sourceMetadata?.eventId ?? sourceMetadata?.correlationId ?? event?.aggregateId,
      saga: 'shipping-dispatch-ready-sync',
    };
  }

  private resolveEventInstance(event: any): any {
    return event?.payload?.instance ?? {};
  }

  private resolveValue(event: any, path: string): any {
    const normalizedPath = String(path || '').replace(/^event\./, '');
    if (!normalizedPath) {
      return undefined;
    }
    if (normalizedPath === '$now') {
      return new Date().toISOString();
    }
    return normalizedPath.split('.').reduce((acc: any, segment: string) => (acc === undefined || acc === null ? undefined : acc[segment]), event);
  }

  private async runCompensations(event: any, correlationId: string, error: Error): Promise<void> {
    this.logger.warn(`Ejecutando compensaciones de saga para ${correlationId}: ${error.message}`);
  }

  private async executeDispatch1(event: any, correlationId: string): Promise<void> {
    const metadata = this.buildCommandMetadata(event, correlationId);
    const payload = {
      orderId: this.resolveValue(event, 'payload.instance.orderId'),
      fulfillmentId: this.resolveValue(event, 'payload.instance.id'),
      status: 'READY_FOR_ASSIGNMENT',
    };
    this.logger.log(`Ejecutando dispatch CreateShippingCommand para la saga executeDispatch1: ${correlationId}`);
    await this.commandBus.execute(new CreateShippingCommand(payload, metadata));
  }

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga cross-context: ${error.message}`);
    this.eventBus.publish(new SagaShippingFailedEvent(error, event));
  }
}

