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

import { InputType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';




@InputType()
export class BaseShippingDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateShipping',
    example: 'Nombre de instancia CreateShipping',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateShippingDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateShipping).',
    example: 'Fecha de creación de la instancia (CreateShipping).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateShipping).',
    example: 'Fecha de actualización de la instancia (CreateShipping).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateShipping).',
    example:
      'Usuario que realiza la creación de la instancia (CreateShipping).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateShipping).',
    example: 'Estado de activación de la instancia (CreateShipping).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del shipment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del shipment', nullable: false })
  shipmentCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Orden comercial asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Orden comercial asociada', nullable: false })
  orderId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Fulfillment que originó el shipment',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Fulfillment que originó el shipment', nullable: false })
  fulfillmentId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Transportista asignado',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Transportista asignado', nullable: true })
  transporterId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Carrier o integrador logístico externo',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Carrier o integrador logístico externo', nullable: false })
  carrierCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Número de tracking',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Número de tracking', nullable: true })
  trackingNumber?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado actual del shipment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado actual del shipment', nullable: false })
  status!: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'ETA calculado',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'ETA calculado', nullable: true })
  etaAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha/hora de entrega',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha/hora de entrega', nullable: true })
  deliveredAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Prueba de entrega',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Prueba de entrega', nullable: true })
  proofOfDelivery?: Record<string, any> = {};

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Código de novedad o excepción',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Código de novedad o excepción', nullable: true })
  exceptionCode?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos del shipment',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos del shipment', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseShippingDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class ShippingDto extends BaseShippingDto {
  // Propiedades específicas de la clase ShippingDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<ShippingDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<ShippingDto>): ShippingDto {
    const instance = new ShippingDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class ShippingValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => ShippingDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => ShippingDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class ShippingOutPutDto extends BaseShippingDto {
  // Propiedades específicas de la clase ShippingOutPutDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<ShippingOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<ShippingOutPutDto>): ShippingOutPutDto {
    const instance = new ShippingOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateShippingDto extends BaseShippingDto {
  // Propiedades específicas de la clase CreateShippingDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateShipping a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateShippingDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateShippingDto>): CreateShippingDto {
    const instance = new CreateShippingDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateShippingDto {
  @ApiProperty({
    type: () => String,
    description: 'Identificador',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  @ApiProperty({
    type: () => CreateShippingDto,
    description: 'Instancia CreateShipping o UpdateShipping',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateShippingDto, { nullable: true })
  input?: CreateShippingDto | UpdateShippingDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteShippingDto {
  // Propiedades específicas de la clase DeleteShippingDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteShipping a eliminar',
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string = '';

  @ApiProperty({
    type: () => String,
    description: 'Lista de identificadores de instancias a eliminar',
    example:
      'Se proporciona una lista de identificadores de DeleteShipping a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateShippingDto extends BaseShippingDto {
  // Propiedades específicas de la clase UpdateShippingDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateShipping a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateShippingDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateShippingDto>): UpdateShippingDto {
    const instance = new UpdateShippingDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



