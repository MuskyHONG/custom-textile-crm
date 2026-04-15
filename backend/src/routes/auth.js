const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// 注册路由
router.post('/register', authController.register);

// 登录路由
router.post('/login', authController.login);

// 获取当前用户信息路由（需要认证）
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;