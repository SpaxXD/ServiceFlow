export interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ClientEntity implements Client {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(client: Client) {
    this.id = client.id;
    this.name = client.name;
    this.email = client.email;
    this.createdAt = client.createdAt;
    this.updatedAt = client.updatedAt;
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  isValidName(): boolean {
    return this.name && this.name.trim().length > 0;
  }

  isValid(): boolean {
    return this.isValidEmail() && this.isValidName();
  }
}
