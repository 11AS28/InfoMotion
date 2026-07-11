import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import loginHandler from './api/login.js';
import adminHandler from './api/admin.js';
import diplomaViewHandler from './api/diploma-view.js';

const app = express();
app.use(express.json());

// Adaptor simplu: Express -> semnătura (req, res) pe care o folosești deja
app.post('/api/login', (req, res) => loginHandler(req, res));
app.post('/api/admin', (req, res) => adminHandler(req, res));
app.get('/api/diploma-view', (req, res) => diplomaViewHandler(req, res));

const PORT = 3001;
app.listen(PORT, () => console.log(`Dev API server pornit pe http://localhost:${PORT}`));