"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const initTables_1 = require("./infra/database/initTables");
const routes_1 = require("./presentation/routes/routes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Cria tabelas no PostgreSQL
(0, initTables_1.criarTabelas)();
app.use(routes_1.routes);
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
