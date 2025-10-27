import express from "express";
import { criarTabelas } from "./infra/database/initTables";
import { jogadoresRoutes } from "./presentation/routes/jogadores_routes";
import { partidasRoutes } from "./presentation/routes/partidas_routes";
import { convitesRoutes } from "./presentation/routes/convites_routes";
import { adesaoRoutes } from "./presentation/routes/adesoes_routes";

const app = express();
app.use(express.json());

// Cria tabelas no PostgreSQL
criarTabelas();

app.use(jogadoresRoutes);
app.use(partidasRoutes);
app.use(convitesRoutes);
app.use(adesaoRoutes);

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));