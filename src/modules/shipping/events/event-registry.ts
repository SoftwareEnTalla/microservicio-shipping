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


import { BaseEvent } from './base.event';
import { ShippingCreatedEvent } from './shippingcreated.event';
import { ShippingUpdatedEvent } from './shippingupdated.event';
import { ShippingDeletedEvent } from './shippingdeleted.event';
import { ShipmentCreatedEvent } from './shipmentcreated.event';
import { TransporterAssignedEvent } from './transporterassigned.event';
import { ShipmentDispatchedEvent } from './shipmentdispatched.event';
import { ShipmentInTransitEvent } from './shipmentintransit.event';
import { ShipmentDeliveredEvent } from './shipmentdelivered.event';
import { ShipmentExceptionRaisedEvent } from './shipmentexceptionraised.event';
import { DispatchReadyEvent } from './dispatchready.event';
import { TransporterAvailabilityUpdatedEvent } from './transporteravailabilityupdated.event';

export type RegisteredEventClass<T extends BaseEvent = BaseEvent> = new (
  aggregateId: string,
  payload: any
) => T;

export interface RegisteredEventDefinition<T extends BaseEvent = BaseEvent> {
  topic: string;
  eventName: string;
  version: string;
  eventClass: RegisteredEventClass<T>;
  retryTopic: string;
  dlqTopic: string;
  maxRetries: number;
  replayable: boolean;
}

const createEventDefinition = <T extends BaseEvent>(
  topic: string,
  eventClass: RegisteredEventClass<T>,
  overrides?: Partial<Omit<RegisteredEventDefinition<T>, 'topic' | 'eventName' | 'eventClass'>>,
): RegisteredEventDefinition<T> => ({
  topic,
  eventName: eventClass.name,
  version: overrides?.version ?? '1.0.0',
  eventClass,
  retryTopic: overrides?.retryTopic ?? topic + '-retry',
  dlqTopic: overrides?.dlqTopic ?? topic + '-dlq',
  maxRetries: overrides?.maxRetries ?? 3,
  replayable: overrides?.replayable ?? true,
});

const EVENT_DEFINITION_OVERRIDES: Partial<Record<string, Partial<Omit<RegisteredEventDefinition, 'topic' | 'eventName' | 'eventClass'>>>> = {
  'shipment-created': {
    version: '1.0.0',
    maxRetries: 5,
    replayable: true,
  },
  'transporter-assigned': {
    version: '1.0.0',
    maxRetries: 5,
    replayable: true,
  },
  'shipment-dispatched': {
    version: '1.0.0',
    maxRetries: 5,
    replayable: true,
  },
  'shipment-in-transit': {
    version: '1.0.0',
    maxRetries: 5,
    replayable: true,
  },
  'shipment-delivered': {
    version: '1.0.0',
    maxRetries: 5,
    replayable: true,
  },
  'shipment-exception-raised': {
    version: '1.0.0',
    maxRetries: 5,
    replayable: true,
  },
};

export const EVENT_DEFINITIONS: Record<string, RegisteredEventDefinition> = {
  'shipping-created': createEventDefinition('shipping-created', ShippingCreatedEvent, EVENT_DEFINITION_OVERRIDES['shipping-created']),
  'shipping-updated': createEventDefinition('shipping-updated', ShippingUpdatedEvent, EVENT_DEFINITION_OVERRIDES['shipping-updated']),
  'shipping-deleted': createEventDefinition('shipping-deleted', ShippingDeletedEvent, EVENT_DEFINITION_OVERRIDES['shipping-deleted']),
  'shipment-created': createEventDefinition('shipment-created', ShipmentCreatedEvent, EVENT_DEFINITION_OVERRIDES['shipment-created']),
  'transporter-assigned': createEventDefinition('transporter-assigned', TransporterAssignedEvent, EVENT_DEFINITION_OVERRIDES['transporter-assigned']),
  'shipment-dispatched': createEventDefinition('shipment-dispatched', ShipmentDispatchedEvent, EVENT_DEFINITION_OVERRIDES['shipment-dispatched']),
  'shipment-in-transit': createEventDefinition('shipment-in-transit', ShipmentInTransitEvent, EVENT_DEFINITION_OVERRIDES['shipment-in-transit']),
  'shipment-delivered': createEventDefinition('shipment-delivered', ShipmentDeliveredEvent, EVENT_DEFINITION_OVERRIDES['shipment-delivered']),
  'shipment-exception-raised': createEventDefinition('shipment-exception-raised', ShipmentExceptionRaisedEvent, EVENT_DEFINITION_OVERRIDES['shipment-exception-raised']),
  'dispatch-ready': createEventDefinition('dispatch-ready', DispatchReadyEvent, EVENT_DEFINITION_OVERRIDES['dispatch-ready']),
};

export const EXTERNAL_EVENT_DEFINITIONS: Record<string, RegisteredEventDefinition> = {
  'transporter-availability-updated': createEventDefinition('transporter-availability-updated', TransporterAvailabilityUpdatedEvent, {
    version: '1.0.0',
    retryTopic: 'transporter-availability-updated-retry',
    dlqTopic: 'transporter-availability-updated-dlq',
    maxRetries: 5,
    replayable: true,
  }),
};

const ALL_EVENT_DEFINITIONS: Record<string, RegisteredEventDefinition> = {
  ...EVENT_DEFINITIONS,
  ...EXTERNAL_EVENT_DEFINITIONS,
};

export const EVENT_REGISTRY: Record<string, RegisteredEventClass> = Object.fromEntries(
  Object.values(ALL_EVENT_DEFINITIONS).map((definition) => [definition.topic, definition.eventClass])
);

export const EVENT_TOPICS = Object.values(EVENT_DEFINITIONS).map((definition) => definition.topic);
export const EVENT_RETRY_TOPICS = Object.values(EVENT_DEFINITIONS).map((definition) => definition.retryTopic);
export const EVENT_DLQ_TOPICS = Object.values(EVENT_DEFINITIONS).map((definition) => definition.dlqTopic);
export const EXTERNAL_EVENT_TOPICS = Object.values(EXTERNAL_EVENT_DEFINITIONS).map((definition) => definition.topic);
export const EXTERNAL_EVENT_RETRY_TOPICS = Object.values(EXTERNAL_EVENT_DEFINITIONS).map((definition) => definition.retryTopic);
export const EXTERNAL_EVENT_DLQ_TOPICS = Object.values(EXTERNAL_EVENT_DEFINITIONS).map((definition) => definition.dlqTopic);
export const EVENT_CONSUMER_TOPICS = Array.from(new Set([
  ...EVENT_TOPICS,
  ...EVENT_RETRY_TOPICS,
  ...EXTERNAL_EVENT_TOPICS,
  ...EXTERNAL_EVENT_RETRY_TOPICS,
]));
export const EVENT_ADMIN_TOPICS = Array.from(new Set([
  ...EVENT_TOPICS,
  ...EVENT_RETRY_TOPICS,
  ...EVENT_DLQ_TOPICS,
  ...EXTERNAL_EVENT_RETRY_TOPICS,
  ...EXTERNAL_EVENT_DLQ_TOPICS,
]));

export const resolveEventDefinition = (candidate?: string): RegisteredEventDefinition | undefined => {
  if (!candidate) {
    return undefined;
  }

  if (ALL_EVENT_DEFINITIONS[candidate]) {
    return ALL_EVENT_DEFINITIONS[candidate];
  }

  return Object.values(ALL_EVENT_DEFINITIONS).find(
    (definition) =>
      definition.topic === candidate ||
      definition.retryTopic === candidate ||
      definition.dlqTopic === candidate ||
      definition.eventName === candidate,
  );
};
