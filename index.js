import express from 'express';

import "dotenv/config"
import swaggerUi from 'swagger-ui-express';
import routes from './routes.js';
import yaml from 'js-yaml';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use("/api", routes);

const swaggerDocument = yaml.load(fs.readFileSync('./swagger-docs/main-apis.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});