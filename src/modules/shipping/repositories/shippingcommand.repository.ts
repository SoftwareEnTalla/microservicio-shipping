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
import { Injectable, NotFoundException, Optional, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  Repository,
  UpdateResult,
} from 'typeorm';


import { BaseEntity } from '../entities/base.entity';
import { Shipping } from '../entities/shipping.entity';
import { ShippingQueryRepository } from './shippingquery.repository';
import { generateCacheKey } from 'src/utils/functions';
import { Cacheable } from '../decorators/cache.decorator';
import {ShippingRepository} from './shipping.repository';

//Logger
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

//Events and EventHandlers
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ShippingCreatedEvent } from '../events/shippingcreated.event';
import { ShippingUpdatedEvent } from '../events/shippingupdated.event';
import { ShippingDeletedEvent } from '../events/shippingdeleted.event';
import { ShipmentCreatedEvent } from "../events/shipmentcreated.event";
import { TransporterAssignedEvent } from "../events/transporterassigned.event";
import { ShipmentDispatchedEvent } from "../events/shipmentdispatched.event";
import { ShipmentInTransitEvent } from "../events/shipmentintransit.event";
import { ShipmentDeliveredEvent } from "../events/shipmentdelivered.event";
import { ShipmentExceptionRaisedEvent } from "../events/shipmentexceptionraised.event";

//Enfoque Event Sourcing
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { BaseEvent } from '../events/base.event';

//Event Sourcing Config
import { EventSourcingHelper } from '../shared/decorators/event-sourcing.helper';
import { EventSourcingConfigOptions } from '../shared/decorators/event-sourcing.decorator';


@EventsHandler(ShippingCreatedEvent, ShippingUpdatedEvent, ShippingDeletedEvent, ShipmentCreatedEvent, TransporterAssignedEvent, ShipmentDispatchedEvent, ShipmentInTransitEvent, ShipmentDeliveredEvent, ShipmentExceptionRaisedEvent)
@Injectable()
export class ShippingCommandRepository implements IEventHandler<BaseEvent>{

  //Constructor del repositorio de datos: ShippingCommandRepository
  constructor(
    @InjectRepository(Shipping)
    private readonly repository: Repository<Shipping>,
    private readonly shippingRepository: ShippingQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
    private readonly eventBus: EventBus,
    @Optional() @Inject('EVENT_SOURCING_CONFIG') 
    private readonly eventSourcingConfig: EventSourcingConfigOptions = EventSourcingHelper.getDefaultConfig()
  ) {
    this.validate();
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  private validate(): void {
    const entityInstance = Object.create(Shipping.prototype);

    if (!(entityInstance instanceof BaseEntity)) {
      throw new Error(
        `El tipo ${Shipping.name} no extiende de BaseEntity. Asegúrate de que todas las entidades hereden correctamente.`
      );
    }
  }

  // Helper para determinar si usar Event Sourcing
  private shouldPublishEvent(): boolean {
    return EventSourcingHelper.shouldPublishEvents(this.eventSourcingConfig);
  }

  private shouldUseProjections(): boolean {
    return EventSourcingHelper.shouldUseProjections(this.eventSourcingConfig);
  }


  // ----------------------------
  // MÉTODOS DE PROYECCIÓN (Event Handlers) para enfoque Event Sourcing
  // ----------------------------

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  async handle(event: any) {
    // Solo manejar eventos si las proyecciones están habilitadas
    if (!this.shouldUseProjections()) {
      logger.debug('Projections are disabled, skipping event handling');
      return false;
    }
    
    logger.info('Ready to handle Shipping event on repository:', event);
    switch (event.constructor.name) {
      case 'ShippingCreatedEvent':
        return await this.onShippingCreated(event);
      case 'ShippingUpdatedEvent':
        return await this.onShippingUpdated(event);
      case 'ShippingDeletedEvent':
        return await this.onShippingDeleted(event);
      case 'ShipmentCreatedEvent':
        return await this.onShipmentCreated(event);
      case 'TransporterAssignedEvent':
        return await this.onTransporterAssigned(event);
      case 'ShipmentDispatchedEvent':
        return await this.onShipmentDispatched(event);
      case 'ShipmentInTransitEvent':
        return await this.onShipmentInTransit(event);
      case 'ShipmentDeliveredEvent':
        return await this.onShipmentDelivered(event);
      case 'ShipmentExceptionRaisedEvent':
        return await this.onShipmentExceptionRaised(event);
    }
    return false;
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<Shipping>('createShipping', args[0], args[1]),
    ttl: 60,
  })
  private async onShippingCreated(event: ShippingCreatedEvent) {
    logger.info('Ready to handle onShippingCreated event on repository:', event);
    const entity = new Shipping();
    entity.id = event.aggregateId;
    Object.assign(entity, event.payload.instance);
    // Asegurar que el tipo discriminador esté establecido
    if (!entity.type) {
      entity.type = 'shipping';
    }
    logger.info('Ready to save entity from event\'s payload:', entity);
    return await this.repository.save(entity);
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<Shipping>('updateShipping', args[0], args[1]),
    ttl: 60,
  })
  private async onShippingUpdated(event: ShippingUpdatedEvent) {
    logger.info('Ready to handle onShippingUpdated event on repository:', event);
    return await this.repository.update(
      event.aggregateId,
      event.payload.instance
    );
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<Shipping>('deleteShipping', args[0], args[1]),
    ttl: 60,
  })
  private async onShippingDeleted(event: ShippingDeletedEvent) {
    logger.info('Ready to handle onShippingDeleted event on repository:', event);
    return await this.repository.delete(event.aggregateId);
  }

  private async onShipmentCreated(event: ShipmentCreatedEvent) {
    logger.info('Ready to handle onShipmentCreated event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'shipping'
      } as Partial<Shipping>);
      return await this.repository.save(projectedEntity as Shipping);
    }
    return true;
  }

  private async onTransporterAssigned(event: TransporterAssignedEvent) {
    logger.info('Ready to handle onTransporterAssigned event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'shipping'
      } as Partial<Shipping>);
      return await this.repository.save(projectedEntity as Shipping);
    }
    return true;
  }

  private async onShipmentDispatched(event: ShipmentDispatchedEvent) {
    logger.info('Ready to handle onShipmentDispatched event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'shipping'
      } as Partial<Shipping>);
      return await this.repository.save(projectedEntity as Shipping);
    }
    return true;
  }

  private async onShipmentInTransit(event: ShipmentInTransitEvent) {
    logger.info('Ready to handle onShipmentInTransit event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'shipping'
      } as Partial<Shipping>);
      return await this.repository.save(projectedEntity as Shipping);
    }
    return true;
  }

  private async onShipmentDelivered(event: ShipmentDeliveredEvent) {
    logger.info('Ready to handle onShipmentDelivered event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'shipping'
      } as Partial<Shipping>);
      return await this.repository.save(projectedEntity as Shipping);
    }
    return true;
  }

  private async onShipmentExceptionRaised(event: ShipmentExceptionRaisedEvent) {
    logger.info('Ready to handle onShipmentExceptionRaised event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'shipping'
      } as Partial<Shipping>);
      return await this.repository.save(projectedEntity as Shipping);
    }
    return true;
  }


  // ----------------------------
  // MÉTODOS CRUD TRADICIONALES (Compatibilidad)
  // ----------------------------
 
  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Shipping>('createShipping',args[0], args[1]), ttl: 60 })
  async create(entity: Shipping): Promise<Shipping> {
    logger.info('Ready to create Shipping on repository:', entity);
    
    // Asegurar que el tipo discriminador esté establecido antes de guardar
    if (!entity.type) {
      entity.type = 'shipping';
    }
    
    const result = await this.repository.save(entity);
    logger.info('New instance of Shipping was created with id:'+ result.id+' on repository:', result);
    
    // Publicar evento al EventBus local (sagas) y a Kafka si está habilitado
    if (this.shouldPublishEvent()) {
      const event = new ShippingCreatedEvent(result.id, {
        instance: result,
        metadata: {
          initiatedBy: result.creator,
          correlationId: result.id,
        },
      });
      this.eventBus.publish(event);
      this.eventPublisher.publish(event);
    }
    return result;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Shipping[]>('createShippings',args[0], args[1]), ttl: 60 })
  async bulkCreate(entities: Shipping[]): Promise<Shipping[]> {
    logger.info('Ready to create Shipping on repository:', entities);
    
    // Asegurar que el tipo discriminador esté establecido para todas las entidades
    entities.forEach(entity => {
      if (!entity.type) {
        entity.type = 'shipping';
      }
    });
    
    const result = await this.repository.save(entities);
    logger.info('New '+entities.length+' instances of Shipping was created on repository:', result);
    
    // Publicar eventos al EventBus local (sagas) y a Kafka si está habilitado
    if (this.shouldPublishEvent()) {
      const events = result.map((el) => new ShippingCreatedEvent(el.id, {
        instance: el,
        metadata: {
          initiatedBy: el.creator,
          correlationId: el.id,
        },
      }));
      events.forEach(event => this.eventBus.publish(event));
      this.eventPublisher.publishAll(events);
    }
    return result;
  }

  
  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Shipping>('updateShipping',args[0], args[1]), ttl: 60 })
  async update(
    id: string,
    partialEntity: Partial<Shipping>
  ): Promise<Shipping | null> {
    logger.info('Ready to update Shipping on repository:', partialEntity);
    let result = await this.repository.update(id, partialEntity);
    logger.info('update Shipping on repository was successfully :', partialEntity);
    let instance=await this.shippingRepository.findById(id);
    logger.info('Updated instance of Shipping with id: ${id} was finded on repository:', instance);
    
    if(instance && this.shouldPublishEvent()) {
      logger.info('Ready to publish or fire event ShippingUpdatedEvent on repository:', instance);
      const event = new ShippingUpdatedEvent(instance.id, {
          instance: instance,
          metadata: {
            initiatedBy: instance.createdBy || 'system',
            correlationId: id,
          },
        });
      this.eventBus.publish(event);
      this.eventPublisher.publish(event);
    }   
    return instance;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Shipping[]>('updateShippings',args[0], args[1]), ttl: 60 })
  async bulkUpdate(entities: Partial<Shipping>[]): Promise<Shipping[]> {
    const updatedEntities: Shipping[] = [];
    logger.info('Ready to update '+entities.length+' entities on repository:', entities);
    
    for (const entity of entities) {
      if (entity.id) {
        const updatedEntity = await this.update(entity.id, entity);
        if (updatedEntity) {
          updatedEntities.push(updatedEntity);
          if (this.shouldPublishEvent()) {
            const updateEvent = new ShippingUpdatedEvent(updatedEntity.id, {
                instance: updatedEntity,
                metadata: {
                  initiatedBy: updatedEntity.createdBy || 'system',
                  correlationId: entity.id,
                },
              });
            this.eventBus.publish(updateEvent);
            this.eventPublisher.publish(updateEvent);
          }
        }
      }
    }
    logger.info('Already updated '+updatedEntities.length+' entities on repository:', updatedEntities);
    return updatedEntities;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string>('deleteShipping',args[0]), ttl: 60 })
  async delete(id: string): Promise<DeleteResult> {
     logger.info('Ready to delete entity with id: ${id} on repository:', id);
     const entity = await this.shippingRepository.findOne({ id });
     if(!entity){
      throw new NotFoundException(`No se encontro el id: ${id}`);
     }
     const result = await this.repository.delete({ id });
     logger.info('Entity deleted with id: ${id} on repository:', result);
     
     if (this.shouldPublishEvent()) {
       logger.info('Ready to publish/fire ShippingDeletedEvent on repository:', result);
       const event = new ShippingDeletedEvent(id, {
        instance: entity,
        metadata: {
          initiatedBy: entity.createdBy || 'system',
          correlationId: entity.id,
        },
      });
       this.eventBus.publish(event);
       this.eventPublisher.publish(event);
     }
     return result;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(ShippingRepository.name)
      .get(ShippingRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string[]>('deleteShippings',args[0]), ttl: 60 })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    logger.info('Ready to delete '+ids.length+' entities on repository:', ids);
    const result = await this.repository.delete(ids);
    logger.info('Already deleted '+ids.length+' entities on repository:', result);
    
    if (this.shouldPublishEvent()) {
      logger.info('Ready to publish/fire ShippingDeletedEvent on repository:', result);
      const deleteEvents = await Promise.all(ids.map(async (id) => {
          const entity = await this.shippingRepository.findOne({ id });
          if(!entity){
            throw new NotFoundException(`No se encontro el id: ${id}`);
          }
          return new ShippingDeletedEvent(id, {
            instance: entity,
            metadata: {
              initiatedBy: entity.createdBy || 'system',
              correlationId: entity.id,
            },
          });
        }));
      deleteEvents.forEach(event => this.eventBus.publish(event));
      this.eventPublisher.publishAll(deleteEvents);
    }
    return result;
  }
}


