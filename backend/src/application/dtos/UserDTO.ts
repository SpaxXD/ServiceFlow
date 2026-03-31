import { UserRole } from '../../domain/entities/User';

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDTO;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
