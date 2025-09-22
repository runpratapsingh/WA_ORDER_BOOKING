import express from "express";
import bodyParser from "body-parser";
import webhookRoutes from "./src/routes/webhookRoutes.js"; // Adjust path if index.js is in root
import { config } from "./src/config/config.js"; // Adjust path if index.js is in root

const app = express();

app.use(bodyParser.json());
app.use("/", webhookRoutes);

app.listen(config.port, () =>
  console.log(`🚀 Server running on port ${config.port}`)
);
