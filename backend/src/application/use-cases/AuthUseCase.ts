import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { CreateUserDTO, LoginDTO, LoginResponseDTO, UserResponseDTO } from '../dtos/UserDTO';
import { ValidationError, ConflictError, UnauthorizedError } from '../../shared/errors/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../domain/entities/AuditLog';
import { generateUUID, generateRandomToken } from '../../shared/utils/helpers';
import { UserEntity } from '../../domain/entities/User';

export class AuthUseCase {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async register(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      id: generateUUID(),
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.mapToResponseDTO(user);
  }

  async login(dto: LoginDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: this.mapToResponseDTO(user),
    };
  }

  async refreshAccessToken(refreshTokenStr: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await this.refreshTokenRepository.findByToken(refreshTokenStr);
    if (!refreshToken || refreshToken.isExpired()) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await this.userRepository.findById(refreshToken.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user.id);

    await this.refreshTokenRepository.delete(refreshToken.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  async logout(refreshTokenStr: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findByToken(refreshTokenStr);
    if (refreshToken) {
      await this.refreshTokenRepository.delete(refreshToken.id);
    }
  }

  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' },
    );
  }

  private async createRefreshToken(userId: string): Promise<RefreshToken> {
    const oldToken = await this.refreshTokenRepository.findByUserId(userId);
    if (oldToken) {
      await this.refreshTokenRepository.delete(oldToken.id);
    }

    const token = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await this.refreshTokenRepository.create(
      new RefreshToken(generateUUID(), userId, token, expiresAt, new Date()),
    );
  }

  private mapToResponseDTO(user: any): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
