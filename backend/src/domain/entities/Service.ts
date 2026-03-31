export enum ServiceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Service {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceEntity implements Service {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(service: Service) {
    this.id = service.id;
    this.clientId = service.clientId;
    this.title = service.title;
    this.description = service.description;
    this.value = service.value;
    this.status = service.status;
    this.createdAt = service.createdAt;
    this.updatedAt = service.updatedAt;
  }

  isValidTitle(): boolean {
    return this.title && this.title.trim().length > 0;
  }

  isValidValue(): boolean {
    return this.value > 0;
  }

  isValid(): boolean {
    return this.isValidTitle() && this.isValidValue();
  }

  canBeMarkedComplete(): boolean {
    return this.status !== ServiceStatus.COMPLETED;
  }

  markAsCompleted(): void {
    this.status = ServiceStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  markAsInProgress(): void {
    this.status = ServiceStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  markAsPending(): void {
    this.status = ServiceStatus.PENDING;
    this.updatedAt = new Date();
  }
}
