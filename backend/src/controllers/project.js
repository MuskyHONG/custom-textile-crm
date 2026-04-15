const Project = require('../models/project');
const Template = require('../models/template');
const Customer = require('../models/customer');
const logger = require('../utils/logger');

/**
 * 获取项目列表
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('customerId').sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    logger.error(`Error getting projects: ${error.message}`);
    res.status(500).json({ message: 'Error getting projects' });
  }
};

/**
 * 获取项目详情
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('customerId');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ project });
  } catch (error) {
    logger.error(`Error getting project: ${error.message}`);
    res.status(500).json({ message: 'Error getting project' });
  }
};

/**
 * 创建项目
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.createProject = async (req, res) => {
  try {
    const { customerId, name, parameters, discountPrice, status } = req.body;
    
    const project = new Project({
      customerId,
      name,
      parameters,
      discountPrice,
      status: status || 'pending'
    });
    
    await project.save();
    
    // 将项目ID添加到客户的projects数组中
    await Customer.findByIdAndUpdate(customerId, {
      $push: { projects: project._id }
    });
    
    logger.info(`Project created: ${project.name}`);
    
    // 重新查询项目，包含客户信息
    const createdProject = await Project.findById(project._id).populate('customerId');
    res.json({ project: createdProject });
  } catch (error) {
    logger.error(`Error creating project: ${error.message}`);
    res.status(500).json({ message: 'Error creating project' });
  }
};

/**
 * 更新项目
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.updateProject = async (req, res) => {
  try {
    const { customerId, name, parameters, status } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    project.customerId = customerId || project.customerId;
    project.name = name || project.name;
    project.parameters = parameters || project.parameters;
    project.status = status || project.status;
    
    await project.save();
    logger.info(`Project updated: ${project.name}`);
    
    // 重新查询项目，包含客户信息
    const updatedProject = await Project.findById(project._id).populate('customerId');
    res.json({ project: updatedProject });
  } catch (error) {
    logger.error(`Error updating project: ${error.message}`);
    res.status(500).json({ message: 'Error updating project' });
  }
};

/**
 * 删除项目
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await project.remove();
    logger.info(`Project deleted: ${project.name}`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting project: ${error.message}`);
    res.status(500).json({ message: 'Error deleting project' });
  }
};

/**
 * 获取项目模板列表
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.json({ templates });
  } catch (error) {
    logger.error(`Error getting templates: ${error.message}`);
    res.status(500).json({ message: 'Error getting templates' });
  }
};

/**
 * 创建项目模板
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.createTemplate = async (req, res) => {
  try {
    const { name, parameters } = req.body;
    
    const existingTemplate = await Template.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({ message: 'Template name already exists' });
    }
    
    const template = new Template({
      name,
      parameters
    });
    
    await template.save();
    logger.info(`Template created: ${template.name}`);
    res.json({ template });
  } catch (error) {
    logger.error(`Error creating template: ${error.message}`);
    res.status(500).json({ message: 'Error creating template' });
  }
};

/**
 * 删除项目模板
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {void}
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    await template.remove();
    logger.info(`Template deleted: ${template.name}`);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting template: ${error.message}`);
    res.status(500).json({ message: 'Error deleting template' });
  }
};