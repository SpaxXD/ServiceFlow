import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../application/dtos/UserDTO';
import { UnauthorizedError } from '../../shared/errors/AppError';

export class JWTService {
  static JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  static ACCESS_TOKEN_EXPIRY = '15m';
  static REFRESH_TOKEN_EXPIRY = '7d';

  static generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  static generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}
