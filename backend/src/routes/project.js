const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project');
const authMiddleware = require('../middleware/auth');

// 获取项目列表（需要认证）
router.get('/', authMiddleware, projectController.getProjects);

// 创建项目（需要认证）
router.post('/', authMiddleware, projectController.createProject);

// 获取项目模板列表（需要认证）
router.get('/templates', authMiddleware, projectController.getTemplates);

// 创建项目模板（需要认证）
router.post('/templates', authMiddleware, projectController.createTemplate);

// 删除项目模板（需要认证）
router.delete('/templates/:id', authMiddleware, projectController.deleteTemplate);

// 获取项目详情（需要认证）
router.get('/:id', authMiddleware, projectController.getProjectById);

// 更新项目（需要认证）
router.put('/:id', authMiddleware, projectController.updateProject);

// 删除项目（需要认证）
router.delete('/:id', authMiddleware, projectController.deleteProject);

module.exports = router;