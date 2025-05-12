export const workloadApi = {
  getTasks: async () => [],
  createTask: async (task: any) => ({}),
  updateTask: async (task: any) => ({}),
  deleteTask: async (id: string) => ({}),
  getUsers: async (): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    role: 'admin' | 'user';
    address: string;
    city: string;
    postalCode: string;
    updatedAt: Date;
  }[]> => [
    {
      id: '1',
      name: 'Alice',
      createdAt: new Date(),
      email: 'alice@example.com',
      role: 'admin',
      address: '1 rue de Paris',
      city: 'Paris',
      postalCode: '75001',
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Bob',
      createdAt: new Date(),
      email: 'bob@example.com',
      role: 'user',
      address: '2 avenue de Lyon',
      city: 'Lyon',
      postalCode: '69000',
      updatedAt: new Date(),
    },
  ],
  getSites: async () => [
    {
      id: '1',
      name: 'Site A',
      createdAt: new Date(),
      address: '10 rue du Site',
      city: 'Marseille',
      postalCode: '13000',
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Site B',
      createdAt: new Date(),
      address: '20 avenue du Port',
      city: 'Nice',
      postalCode: '06000',
      updatedAt: new Date(),
    },
  ],
}; 