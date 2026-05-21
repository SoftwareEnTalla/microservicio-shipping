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

import { Column, Entity, OneToOne, JoinColumn, ChildEntity, ManyToOne, OneToMany, ManyToMany, JoinTable, Index, Check, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CreateShippingDto, UpdateShippingDto, DeleteShippingDto } from '../dtos/all-dto';
import { IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';



@ChildEntity('shipping')
@ObjectType()
export class Shipping extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de Shipping",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de Shipping", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia Shipping' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de Shipping",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de Shipping", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia Shipping' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del shipment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del shipment', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, unique: true, comment: 'Código del shipment' })
  shipmentCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Orden comercial asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Orden comercial asociada', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Orden comercial asociada' })
  orderId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Fulfillment que originó el shipment',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Fulfillment que originó el shipment', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Fulfillment que originó el shipment' })
  fulfillmentId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Transportista asignado',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Transportista asignado', nullable: true })
  @Column({ type: 'uuid', nullable: true, comment: 'Transportista asignado' })
  transporterId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Carrier o integrador logístico externo',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Carrier o integrador logístico externo', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, comment: 'Carrier o integrador logístico externo' })
  carrierCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Número de tracking',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Número de tracking', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, unique: true, comment: 'Número de tracking' })
  trackingNumber?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado actual del shipment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado actual del shipment', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, comment: 'Estado actual del shipment' })
  status!: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'ETA calculado',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'ETA calculado', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'ETA calculado' })
  etaAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha/hora de entrega',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha/hora de entrega', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha/hora de entrega' })
  deliveredAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Prueba de entrega',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Prueba de entrega', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Prueba de entrega' })
  proofOfDelivery?: Record<string, any> = {};

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Código de novedad o excepción',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Código de novedad o excepción', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, comment: 'Código de novedad o excepción' })
  exceptionCode?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos del shipment',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos del shipment', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos operativos del shipment' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: assigned-transporter-must-exist-before-dispatch
    // No se puede despachar sin transportista asignado.
    if (!(!(this.transporterId === undefined || this.transporterId === null || (typeof this.transporterId === 'string' && String(this.transporterId).trim() === '') || (Array.isArray(this.transporterId) && this.transporterId.length === 0) || (typeof this.transporterId === 'object' && !Array.isArray(this.transporterId) && Object.prototype.toString.call(this.transporterId) === '[object Object]' && Object.keys(Object(this.transporterId)).length === 0)))) {
      throw new Error('SHIPPING_001: El shipment requiere un transportista asignado antes del despacho');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'shipping';
  }

  // Getters y Setters
  get getName(): string {
    return this.name;
  }
  set setName(value: string) {
    this.name = value;
  }
  get getDescription(): string {
    return this.description;
  }

  // Métodos abstractos implementados
  async create(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async update(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async delete(id: string): Promise<BaseEntity> {
    this.id = id;
    return this;
  }

  // Método estático para convertir DTOs a entidad con sobrecarga
  static fromDto(dto: CreateShippingDto): Shipping;
  static fromDto(dto: UpdateShippingDto): Shipping;
  static fromDto(dto: DeleteShippingDto): Shipping;
  static fromDto(dto: any): Shipping {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(Shipping, dto);
  }
}
