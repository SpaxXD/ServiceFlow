export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export interface AuditLog {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  createdAt: Date;
}

export class AuditLogEntity implements AuditLog {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  createdAt: Date;

  constructor(auditLog: AuditLog) {
    this.id = auditLog.id;
    this.userId = auditLog.userId;
    this.entityType = auditLog.entityType;
    this.entityId = auditLog.entityId;
    this.action = auditLog.action;
    this.oldValues = auditLog.oldValues;
    this.newValues = auditLog.newValues;
    this.createdAt = auditLog.createdAt;
  }
}

export class RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;

  constructor(id: string, userId: string, token: string, expiresAt: Date, createdAt: Date) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
