import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { AuthUseCase } from '../../application/use-cases/AuthUseCase';
import { UserRepository } from '../../infra/repositories/UserRepository';
import { RefreshTokenRepository } from '../../infra/repositories/RefreshTokenRepository';

export async function authRoutes(fastify: FastifyInstance) {
  const userRepository = new UserRepository();
  const refreshTokenRepository = new RefreshTokenRepository();
  const authUseCase = new AuthUseCase(userRepository, refreshTokenRepository);
  const authController = new AuthController(authUseCase);

  fastify.post('/auth/register', (request, reply) => authController.register(request, reply));
  fastify.post('/auth/login', (request, reply) => authController.login(request, reply));
  fastify.post('/auth/refresh', (request, reply) => authController.refresh(request, reply));
  fastify.post('/auth/logout', (request, reply) => authController.logout(request, reply));
}
