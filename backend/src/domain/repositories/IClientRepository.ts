import { Client } from '../entities/Client';

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  update(id: string, client: Partial<Client>): Promise<Client>;
  delete(id: string): Promise<void>;
  list(page: number, pageSize: number, search?: string): Promise<{ data: Client[]; total: number }>;
  findByEmail(email: string): Promise<Client | null>;
}
