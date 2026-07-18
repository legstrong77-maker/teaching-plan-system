require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const lessonPlansRouter = require('./routes/lessonPlans');
const formDataRouter = require('./routes/formData');

const app = express();
const port = 5000; // 固定使用 5000 端口

// CORS 設置
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3006',
      'http://localhost:3000',
      'https://teaching-plan-system.vercel.app'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不允許的來源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// MongoDB 連接
mongoose.set('strictQuery', false);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lesson-plans';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 連接成功');
    // 確保數據庫連接後才啟動服務器
    app.listen(port, () => {
      console.log(`後端服務器運行在端口 ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB 連接錯誤:', err);
    process.exit(1); // 如果無法連接到數據庫，則終止程序
  });

// 路由
app.use('/api/lesson-plans', lessonPlansRouter);
app.use('/api/form-data', formDataRouter);

// 基本路由
app.get('/', (req, res) => {
  res.json({ message: '歡迎使用教案分析系統 API' });
});

// CORS 錯誤處理
app.use((err, req, res, next) => {
  if (err.message === '不允許的來源') {
    return res.status(403).json({
      message: '不允許的來源',
      origin: req.headers.origin
    });
  }
  next(err);
});

// 一般錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('服務器錯誤:', err);
  res.status(500).json({ 
    message: '服務器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.toString() : undefined
  });
}); 