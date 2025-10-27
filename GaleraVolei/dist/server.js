"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const initTables_1 = require("./infra/database/initTables");
const jogadores_routes_1 = require("./presentation/routes/jogadores_routes");
const partidas_routes_1 = require("./presentation/routes/partidas_routes");
const convites_routes_1 = require("./presentation/routes/convites_routes");
const adesoes_routes_1 = require("./presentation/routes/adesoes_routes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Cria tabelas no PostgreSQL
(0, initTables_1.criarTabelas)();
app.use(jogadores_routes_1.jogadoresRoutes);
app.use(partidas_routes_1.partidasRoutes);
app.use(convites_routes_1.convitesRoutes);
app.use(adesoes_routes_1.adesaoRoutes);
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
