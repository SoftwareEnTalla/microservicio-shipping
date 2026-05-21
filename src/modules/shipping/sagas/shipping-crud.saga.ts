/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */


import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  ShippingCreatedEvent,
  ShippingUpdatedEvent,
  ShippingDeletedEvent,
  ShipmentCreatedEvent,
  TransporterAssignedEvent,
  ShipmentDispatchedEvent,
  ShipmentInTransitEvent,
  ShipmentDeliveredEvent,
  ShipmentExceptionRaisedEvent,
} from '../events/exporting.event';
import {
  SagaShippingFailedEvent
} from '../events/shipping-failed.event';
import {
  CreateShippingCommand,
  UpdateShippingCommand,
  DeleteShippingCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class ShippingCrudSaga {
  private readonly logger = new Logger(ShippingCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onShippingCreated = ($events: Observable<ShippingCreatedEvent>) => {
    return $events.pipe(
      ofType(ShippingCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de Shipping: ${event.aggregateId}`);
        void this.handleShippingCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onShippingUpdated = ($events: Observable<ShippingUpdatedEvent>) => {
    return $events.pipe(
      ofType(ShippingUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de Shipping: ${event.aggregateId}`);
        void this.handleShippingUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onShippingDeleted = ($events: Observable<ShippingDeletedEvent>) => {
    return $events.pipe(
      ofType(ShippingDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de Shipping: ${event.aggregateId}`);
        void this.handleShippingDeleted(event);
      }),
      map(() => null)
    );
  };

  @Saga()
  onShipmentCreated = ($events: Observable<ShipmentCreatedEvent>) => {
    return $events.pipe(
      ofType(ShipmentCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio ShipmentCreated: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onTransporterAssigned = ($events: Observable<TransporterAssignedEvent>) => {
    return $events.pipe(
      ofType(TransporterAssignedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio TransporterAssigned: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onShipmentDispatched = ($events: Observable<ShipmentDispatchedEvent>) => {
    return $events.pipe(
      ofType(ShipmentDispatchedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio ShipmentDispatched: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onShipmentInTransit = ($events: Observable<ShipmentInTransitEvent>) => {
    return $events.pipe(
      ofType(ShipmentInTransitEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio ShipmentInTransit: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onShipmentDelivered = ($events: Observable<ShipmentDeliveredEvent>) => {
    return $events.pipe(
      ofType(ShipmentDeliveredEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio ShipmentDelivered: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onShipmentExceptionRaised = ($events: Observable<ShipmentExceptionRaisedEvent>) => {
    return $events.pipe(
      ofType(ShipmentExceptionRaisedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio ShipmentExceptionRaised: ${event.aggregateId}`);
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
    client: LoggerClient.getInstance()
      .registerClient(ShippingCrudSaga.name)
      .get(ShippingCrudSaga.name),
  })
  private async handleShippingCreated(event: ShippingCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Shipping Created completada: ${event.aggregateId}`);
      // Lógica post-creación (ej: enviar notificación, ejecutar comandos adicionales)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

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
    client: LoggerClient.getInstance()
      .registerClient(ShippingCrudSaga.name)
      .get(ShippingCrudSaga.name),
  })
  private async handleShippingUpdated(event: ShippingUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Shipping Updated completada: ${event.aggregateId}`);
      // Lógica post-actualización (ej: actualizar caché)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

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
    client: LoggerClient.getInstance()
      .registerClient(ShippingCrudSaga.name)
      .get(ShippingCrudSaga.name),
  })
  private async handleShippingDeleted(event: ShippingDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Shipping Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaShippingFailedEvent( error,event));
  }
}
