const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDatabase = require('./db');
const User = require('./models/userModel');

const app = express();
const port = process.env.PORT || 4000;
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const adminEmail = 'agrimjain056@gmail.com';

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic API info
app.get('/api', (req, res) => {
  res.json({
    name: 'ToolPool MERN API',
    message: 'API is ready and structured with Express Router'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected', app: 'ToolPool' });
});

app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

async function startServer() {
  await connectDatabase();
  await User.updateOne({ email: adminEmail }, { $set: { role: 'admin' } });
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

startServer();
