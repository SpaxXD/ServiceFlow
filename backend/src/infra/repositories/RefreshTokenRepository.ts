import { prisma } from '../database/connection';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../domain/entities/AuditLog';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    return await prisma.refreshToken.create({
      data: {
        id: refreshToken.id,
        userId: refreshToken.userId,
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return await prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken | null> {
    return await prisma.refreshToken.findFirst({
      where: { userId },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
