import { RefreshToken } from '../entities/AuditLog';

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken | null>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
