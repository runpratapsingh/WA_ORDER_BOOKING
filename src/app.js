import express from 'express';
import bodyParser from 'body-parser';
import webhookRoutes from './routes/webhookRoutes.js';
import { config } from './config/config.js';

const app = express();

app.use(bodyParser.json());
app.use('/api', webhookRoutes);

app.listen(config.port, () => console.log(`🚀 Server running on port ${config.port}`));