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


import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";

//Definición de entidades
import { Shipping } from "../entities/shipping.entity";

//Definición de comandos
import {
  CreateShippingCommand,
  UpdateShippingCommand,
  DeleteShippingCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { ShippingQueryService } from "../services/shippingquery.service";


import { ShippingResponse, ShippingsResponse } from "../types/shipping.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateShippingDto, 
CreateOrUpdateShippingDto, 
ShippingValueInput, 
ShippingDto, 
CreateShippingDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => Shipping)
export class ShippingResolver {

   //Constructor del resolver de Shipping
  constructor(
    private readonly service: ShippingQueryService,
    private readonly commandBus: CommandBus
  ) {}

  @LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  // Mutaciones
  @Mutation(() => ShippingResponse<Shipping>)
  async createShipping(
    @Args("input", { type: () => CreateShippingDto }) input: CreateShippingDto
  ): Promise<ShippingResponse<Shipping>> {
    return this.commandBus.execute(new CreateShippingCommand(input));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Mutation(() => ShippingResponse<Shipping>)
  async updateShipping(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateShippingDto
  ): Promise<ShippingResponse<Shipping>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateShippingCommand(payLoad, {
        instance: payLoad,
        metadata: {
          initiatedBy: payLoad.createdBy || 'system',
          correlationId: payLoad.id,
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Mutation(() => ShippingResponse<Shipping>)
  async createOrUpdateShipping(
    @Args("data", { type: () => CreateOrUpdateShippingDto })
    data: CreateOrUpdateShippingDto
  ): Promise<ShippingResponse<Shipping>> {
    if (data.id) {
      const existingShipping = await this.service.findById(data.id);
      if (existingShipping) {
        return this.commandBus.execute(
          new UpdateShippingCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateShippingDto | UpdateShippingDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateShippingCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateShippingDto | UpdateShippingDto).createdBy ||
            'system',
          correlationId: data.id || uuidv4(),
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteShipping(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteShippingCommand(id));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  // Queries
  @Query(() => ShippingsResponse<Shipping>)
  async shippings(
    options?: FindManyOptions<Shipping>,
    paginationArgs?: PaginationArgs
  ): Promise<ShippingsResponse<Shipping>> {
    return this.service.findAll(options, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Query(() => ShippingsResponse<Shipping>)
  async shipping(
    @Args("id", { type: () => String }) id: string
  ): Promise<ShippingResponse<Shipping>> {
    return this.service.findById(id);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Query(() => ShippingsResponse<Shipping>)
  async shippingsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => ShippingValueInput }) value: ShippingValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ShippingsResponse<Shipping>> {
    return this.service.findByField(
      field,
      value,
      fromObject.call(PaginationArgs, { page: page, limit: limit })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Query(() => ShippingsResponse<Shipping>)
  async shippingsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ShippingsResponse<Shipping>> {
    const paginationArgs = fromObject.call(PaginationArgs, {
      page: page,
      limit: limit,
    });
    return this.service.findWithPagination({}, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Query(() => Number)
  async totalShippings(): Promise<number> {
    return this.service.count();
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Query(() => ShippingsResponse<Shipping>)
  async searchShippings(
    @Args("where", { type: () => ShippingDto, nullable: false })
    where: Record<string, any>
  ): Promise<ShippingsResponse<Shipping>> {
    const shippings = await this.service.findAndCount(where);
    return shippings;
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Query(() => ShippingResponse<Shipping>, { nullable: true })
  async findOneShipping(
    @Args("where", { type: () => ShippingDto, nullable: false })
    where: Record<string, any>
  ): Promise<ShippingResponse<Shipping>> {
    return this.service.findOne(where);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(ShippingResolver.name)

      .get(ShippingResolver.name),
    })
  @Query(() => ShippingResponse<Shipping>)
  async findOneShippingOrFail(
    @Args("where", { type: () => ShippingDto, nullable: false })
    where: Record<string, any>
  ): Promise<ShippingResponse<Shipping> | Error> {
    return this.service.findOneOrFail(where);
  }
}

