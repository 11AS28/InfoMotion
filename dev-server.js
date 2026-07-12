import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import loginHandler from './api/login.js';
import adminHandler from './api/admin.js';

const app = express();
app.use(express.json());

app.post('/api/login', (req, res) => loginHandler(req, res));
app.post('/api/admin', (req, res) => adminHandler(req, res));

const PORT = 3001;
app.listen(PORT, () => console.log(`Dev API server pornit pe http://localhost:${PORT}`));