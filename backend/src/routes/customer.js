const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');
const authMiddleware = require('../middleware/auth');

// 获取客户列表（需要认证）
router.get('/', authMiddleware, customerController.getCustomers);

// 生成客户编号（需要认证）
router.get('/generate-id', authMiddleware, customerController.generateCustomerId);

// 获取客户详情（需要认证）
router.get('/:id', authMiddleware, customerController.getCustomerById);

// 创建客户（需要认证）
router.post('/', authMiddleware, customerController.createCustomer);

// 更新客户（需要认证）
router.put('/:id', authMiddleware, customerController.updateCustomer);

// 删除客户（需要认证）
router.delete('/:id', authMiddleware, customerController.deleteCustomer);

// 获取客户历史记录（需要认证）
router.get('/:id/history', authMiddleware, customerController.getCustomerHistory);

module.exports = router;