// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

dotenv.config();

const app = express();

// ==================== CORS ====================
const corsOptions = {
  origin: [
    'https://tunga-notes-frontend.vercel.app', // deployed frontend
    'http://localhost:5173' // local Vite dev
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight

app.use(express.json());

// ==================== DATABASE ====================
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Notes API is running',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// ==================== SPA CATCH-ALL ====================
// Optional: only if you want Express to serve React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
}

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
