import { prisma } from '../database/connection';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../domain/entities/AuditLog';

export class AuditLogRepository implements IAuditLogRepository {
  async create(auditLog: AuditLog): Promise<AuditLog> {
    return await prisma.auditLog.create({
      data: {
        id: auditLog.id,
        userId: auditLog.userId,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        action: auditLog.action,
        oldValues: auditLog.oldValues,
        newValues: auditLog.newValues,
      },
    });
  }

  async list(page: number, pageSize: number): Promise<{ data: AuditLog[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);

    return { data, total };
  }

  async findByEntityId(entityId: string): Promise<AuditLog[]> {
    return await prisma.auditLog.findMany({
      where: { entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
