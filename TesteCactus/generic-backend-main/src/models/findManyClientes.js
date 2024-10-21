const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  async execute() {
    try {
      // ... lógica de busca dos clientes ...
      let clientes = await prisma.customers.findMany();
      return clientes;
    } catch (error) {
      // ... tratamento de erros ...
      error.path = "src/models/findManyClientes.js";
      throw error;
    } finally {
      await prisma.$disconnect(); // desconecta o Prisma Client do banco de dados
    }
  },
  async dados() {
    try {
      // ... lógica de busca dos clientes ...
      let clientes = await prisma.metrics.findMany();
      return clientes;
    } catch (error) {
      // ... tratamento de erros ...
      error.path = "src/models/findManyClientes.js";
      throw error;
    } finally {
      await prisma.$disconnect(); // desconecta o Prisma Client do banco de dados
    }
  },
};
