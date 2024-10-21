const { emularConsumoTrafegoSemanaSuave } = require("./trafficGenerate");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main(params) {
  // Cria uma lista de clientes com perfis de consumo diferentes
  const customers = [
    {
      name: "FiberWave",
      perfil: 1,
    },
    {
      name: "NetFusion",
      perfil: 3,
    },
    {
      name: "HyperConnect",
      perfil: 2,
    },
    {
      name: "LinkSphere",
      perfil: 3,
    },
    {
      name: "OptiNet",
      perfil: 2,
    },
  ];

  const customersResponse = await Promise.all(
    customers.map((customer) =>
      prisma.customers.upsert({
        where: { name: customer.name },
        update: {
          name: customer.name,
          perfil: customer.perfil,
        },
        create: {
          name: customer.name,
          perfil: customer.perfil,
        },
      })
    )
  );

  const metrics = customersResponse.map((customer, index) => {
    const bgpData = emularConsumoTrafegoSemanaSuave(customer.id, index);
    return bgpData;
  });
  //createMany Metrics
  const metricsResponse = await Promise.all(
    metrics.map((metric) =>
      prisma.metrics.createMany({
        data: metric,
      })
    )
  );
}

main();
