const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/error');

// 导入路由
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const projectRoutes = require('./routes/project');
const orderRoutes = require('./routes/order');
const statisticsRoutes = require('./routes/statistics');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 连接数据库
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((error) => {
  logger.error(`Error connecting to MongoDB: ${error.message}`);
});

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/statistics', statisticsRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理中间件
app.use(errorMiddleware);

// 启动服务器
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

module.exports = app;