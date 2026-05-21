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


import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { DeleteResult, UpdateResult } from "typeorm";
import { Shipping } from "../entities/shipping.entity";
import { CreateShippingDto, UpdateShippingDto, DeleteShippingDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { ShippingCommandRepository } from "../repositories/shippingcommand.repository";
import { ShippingQueryRepository } from "../repositories/shippingquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { ShippingResponse, ShippingsResponse } from "../types/shipping.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { ShippingQueryService } from "./shippingquery.service";
import { BaseEvent } from "../events/base.event";
import { ShipmentCreatedEvent } from '../events/shipmentcreated.event';
import { TransporterAssignedEvent } from '../events/transporterassigned.event';
import { ShipmentDispatchedEvent } from '../events/shipmentdispatched.event';
import { ShipmentInTransitEvent } from '../events/shipmentintransit.event';
import { ShipmentDeliveredEvent } from '../events/shipmentdelivered.event';
import { ShipmentExceptionRaisedEvent } from '../events/shipmentexceptionraised.event';

@Injectable()
export class ShippingCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(ShippingCommandService.name);
  //Constructo del servicio ShippingCommandService
  constructor(
    private readonly repository: ShippingCommandRepository,
    private readonly queryRepository: ShippingQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
    private moduleRef: ModuleRef
  ) {
    //Inicialice aquí propiedades o atributos
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
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
      .registerClient(ShippingQueryService.name)
      .get(ShippingQueryService.name),
  })
  onModuleInit() {
    //Se ejecuta en la inicialización del módulo
  }

  private dslValue(entityData: Record<string, any>, currentData: Record<string, any>, inputData: Record<string, any>, field: string): any {
    return entityData?.[field] ?? currentData?.[field] ?? inputData?.[field];
  }

  private async publishDslDomainEvents(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventPublisher.publish(event as any);
      if (process.env.EVENT_STORE_ENABLED === "true") {
        await this.eventStore.appendEvent('shipping-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: Shipping | null,
    current?: Shipping | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'update') {
      // Regla de servicio: assigned-transporter-must-exist-before-dispatch
      // No se puede despachar sin transportista asignado.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'transporterId') === undefined || this.dslValue(entityData, currentData, inputData, 'transporterId') === null || (typeof this.dslValue(entityData, currentData, inputData, 'transporterId') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'transporterId')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'transporterId')) && this.dslValue(entityData, currentData, inputData, 'transporterId').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'transporterId') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'transporterId')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'transporterId')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'transporterId'))).length === 0)))) {
        throw new Error('SHIPPING_001: El shipment requiere un transportista asignado antes del despacho');
      }

    }
    if (publishEvents) {
      await this.publishDslDomainEvents(pendingEvents);
    }
  }

  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
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
      .registerClient(ShippingCommandService.name)
      .get(ShippingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateShippingDto>("createShipping", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createShippingDtoInput: CreateShippingDto
  ): Promise<ShippingResponse<Shipping>> {
    try {
      logger.info("Receiving in service:", createShippingDtoInput);
      const candidate = Shipping.fromDto(createShippingDtoInput);
      await this.applyDslServiceRules("create", createShippingDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createShippingDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el shipping no existe
      if (!entity)
        throw new NotFoundException("Entidad Shipping no encontrada.");
      // Devolver shipping
      return {
        ok: true,
        message: "Shipping obtenido con éxito.",
        data: entity,
      };
    } catch (error) {
      logger.info("Error creating entity on service:", error);
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
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
      .registerClient(ShippingCommandService.name)
      .get(ShippingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<Shipping>("createShippings", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createShippingDtosInput: CreateShippingDto[]
  ): Promise<ShippingsResponse<Shipping>> {
    try {
      const entities = await this.repository.bulkCreate(
        createShippingDtosInput.map((entity) => Shipping.fromDto(entity))
      );

      // Respuesta si el shipping no existe
      if (!entities)
        throw new NotFoundException("Entidades Shippings no encontradas.");
      // Devolver shipping
      return {
        ok: true,
        message: "Shippings creados con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
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
      .registerClient(ShippingCommandService.name)
      .get(ShippingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateShippingDto>("updateShipping", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateShippingDto
  ): Promise<ShippingResponse<Shipping>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new Shipping(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el shipping no existe
      if (!entity)
        throw new NotFoundException("Entidades Shippings no encontradas.");
      // Devolver shipping
      return {
        ok: true,
        message: "Shipping actualizada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
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
      .registerClient(ShippingCommandService.name)
      .get(ShippingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateShippingDto>("updateShippings", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateShippingDto[]
  ): Promise<ShippingsResponse<Shipping>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => Shipping.fromDto(entity))
      );
      // Respuesta si el shipping no existe
      if (!entities)
        throw new NotFoundException("Entidades Shippings no encontradas.");
      // Devolver shipping
      return {
        ok: true,
        message: "Shippings actualizadas con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

   @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
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
      .registerClient(ShippingCommandService.name)
      .get(ShippingCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteShippingDto>("deleteShipping", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<ShippingResponse<Shipping>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el shipping no existe
      if (!entity)
        throw new NotFoundException("Instancias de Shipping no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver shipping
      return {
        ok: true,
        message: "Instancia de Shipping eliminada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
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
      .registerClient(ShippingCommandService.name)
      .get(ShippingCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteShippings", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

