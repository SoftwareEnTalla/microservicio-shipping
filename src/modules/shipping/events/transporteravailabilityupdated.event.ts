/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 */

import { BaseEvent, PayloadEvent } from './base.event';

export class TransporterAvailabilityUpdatedEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<any>
  ) {
    super(aggregateId);
  }
}