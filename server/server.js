require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();

// ── Security ──
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ── Body parsing ──
app.use(express.json());

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// ── Health check ──
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ──
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
