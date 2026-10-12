const express = require('express');
const cors = require('cors');
const path = require('path');

const translateRoutes = require('./routes/translate.routes');
const historyRoutes = require('./routes/history.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Phục vụ frontend tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Đăng ký API routes
app.use('/api/translate', translateRoutes);
app.use('/api/history', historyRoutes);

// Phục vụ SPA trang chủ
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Google Translate Clone Server running!`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🕒 Started at: ${new Date().toLocaleTimeString()}`);
    console.log(`===============================================`);
});
