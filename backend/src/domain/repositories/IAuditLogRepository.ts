import { AuditLog } from '../entities/AuditLog';

export interface IAuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  list(page: number, pageSize: number): Promise<{ data: AuditLog[]; total: number }>;
  findByEntityId(entityId: string): Promise<AuditLog[]>;
  findByUserId(userId: string): Promise<AuditLog[]>;
}
