import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTService } from '../auth/JWTService';
import { UnauthorizedError } from '../../shared/errors/AppError';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Missing authorization token');
  }

  const payload = JWTService.verifyAccessToken(token);
  request.user = payload;
}

export async function requireRole(role: string[] | string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(request.user?.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
  };
}

export async function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  if (error.statusCode === 400 && error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      message: 'Validation error',
      errors: error.validation,
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      message: error.message,
    });
  }

  console.error('Unhandled error:', error);
  return reply.status(500).send({
    statusCode: 500,
    message: 'Internal server error',
  });
}
