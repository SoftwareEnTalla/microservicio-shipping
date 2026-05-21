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


import { Module } from "@nestjs/common";
import { ShippingCommandController } from "../controllers/shippingcommand.controller";
import { ShippingQueryController } from "../controllers/shippingquery.controller";
import { ShippingCommandService } from "../services/shippingcommand.service";
import { ShippingQueryService } from "../services/shippingquery.service";

import { ShippingCommandRepository } from "../repositories/shippingcommand.repository";
import { ShippingQueryRepository } from "../repositories/shippingquery.repository";
import { ShippingRepository } from "../repositories/shipping.repository";
import { ShippingResolver } from "../graphql/shipping.resolver";
import { ShippingAuthGuard } from "../guards/shippingauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shipping } from "../entities/shipping.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateShippingHandler } from "../commands/handlers/createshipping.handler";
import { UpdateShippingHandler } from "../commands/handlers/updateshipping.handler";
import { DeleteShippingHandler } from "../commands/handlers/deleteshipping.handler";
import { GetShippingByIdHandler } from "../queries/handlers/getshippingbyid.handler";
import { GetShippingByFieldHandler } from "../queries/handlers/getshippingbyfield.handler";
import { GetAllShippingHandler } from "../queries/handlers/getallshipping.handler";
import { ShippingCrudSaga } from "../sagas/shipping-crud.saga";
import { ShippingDispatchReadySyncSaga } from "../sagas/shipping-dispatch-ready-sync.saga";
import { ShippingTransporterAvailabilitySyncSaga } from "../sagas/shipping-transporter-availability-sync.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { ShippingInterceptor } from "../interceptors/shipping.interceptor";
import { ShippingLoggingInterceptor } from "../interceptors/shipping.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, Shipping]), // Incluir BaseEntity para herencia
    CacheModule.registerAsync({
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: { host: process.env.REDIS_HOST || "data-center-redis", port: parseInt(process.env.REDIS_PORT || "6379", 10) },
            ttl: parseInt(process.env.REDIS_TTL || "60", 10),
          });
          return { store: store as any, isGlobal: true };
        } catch {
          return { isGlobal: true }; // fallback in-memory
        }
      },
    }),
  ],
  controllers: [ShippingCommandController, ShippingQueryController],
  providers: [
    //Services
    EventStoreService,
    ShippingQueryService,
    ShippingCommandService,
  
    //Repositories
    ShippingCommandRepository,
    ShippingQueryRepository,
    ShippingRepository,      
    //Resolvers
    ShippingResolver,
    //Guards
    ShippingAuthGuard,
    //Interceptors
    ShippingInterceptor,
    ShippingLoggingInterceptor,
    //CQRS Handlers
    CreateShippingHandler,
    UpdateShippingHandler,
    DeleteShippingHandler,
    GetShippingByIdHandler,
    GetShippingByFieldHandler,
    GetAllShippingHandler,
    ShippingCrudSaga,
    ShippingDispatchReadySyncSaga,    //Configurations
    ShippingTransporterAvailabilitySyncSaga,
    {
      provide: 'EVENT_SOURCING_CONFIG',
      useFactory: () => ({
        enabled: process.env.EVENT_SOURCING_ENABLED !== 'false',
        kafkaEnabled: process.env.KAFKA_ENABLED !== 'false',
        eventStoreEnabled: process.env.EVENT_STORE_ENABLED === 'true',
        publishEvents: true,
        useProjections: true,
        topics: EVENT_TOPICS
      })
    },
  ],
  exports: [
    CqrsModule,
    KafkaModule,
    //Services
    EventStoreService,
    ShippingQueryService,
    ShippingCommandService,
  
    //Repositories
    ShippingCommandRepository,
    ShippingQueryRepository,
    ShippingRepository,      
    //Resolvers
    ShippingResolver,
    //Guards
    ShippingAuthGuard,
    //Interceptors
    ShippingInterceptor,
    ShippingLoggingInterceptor,
  ],
})
export class ShippingModule {}

