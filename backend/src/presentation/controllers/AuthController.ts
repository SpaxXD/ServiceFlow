import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthUseCase } from '../../application/use-cases/AuthUseCase';
import { CreateUserDTO, LoginDTO } from '../../application/dtos/UserDTO';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'user']),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = CreateUserSchema.parse(request.body);
    const result = await this.authUseCase.register(body as CreateUserDTO);
    return reply.status(201).send(result);
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = LoginSchema.parse(request.body);
    const result = await this.authUseCase.login(body as LoginDTO);
    return reply.status(200).send(result);
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const body = RefreshTokenSchema.parse(request.body);
    const result = await this.authUseCase.refreshAccessToken(body.refreshToken);
    return reply.status(200).send(result);
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const body = RefreshTokenSchema.parse(request.body);
    await this.authUseCase.logout(body.refreshToken);
    return reply.status(204).send();
  }
}
