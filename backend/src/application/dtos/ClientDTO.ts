export interface CreateClientDTO {
  name: string;
  email: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
}

export interface ClientResponseDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListClientsResponseDTO {
  data: ClientResponseDTO[];
  total: number;
  page: number;
  pageSize: number;
}
