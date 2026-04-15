const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const authMiddleware = require('../middleware/auth');

// 获取订单列表（需要认证）
router.get('/', authMiddleware, orderController.getOrders);

// 获取订单详情（需要认证）
router.get('/:id', authMiddleware, orderController.getOrderById);

// 创建订单（需要认证）
router.post('/', authMiddleware, orderController.createOrder);

// 更新订单状态（需要认证）
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

// 取消订单（需要认证）
router.delete('/:id', authMiddleware, orderController.cancelOrder);

module.exports = router;