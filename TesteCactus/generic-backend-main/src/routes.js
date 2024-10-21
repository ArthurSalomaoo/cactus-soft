const { Router } = require("express");

const findByIdClientesController = require("./controllers/client/findManyClientes");

const routes = Router();

//rota para buscar todos os clientes
routes.get("/findManyCliente", findByIdClientesController.handle);
routes.get("/dados", findByIdClientesController.dados);

module.exports = routes;
