import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Modal, Form, Input, message, Select, Tabs, Tag, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { getProjects, createProject, updateProject, deleteProject, getTemplates, createTemplate, deleteTemplate } from '../redux/slices/projectSlice'
import type { RootState } from '../redux/store'
import { Link } from 'react-router-dom'

const { Option } = Select

const ProjectPage: React.FC = () => {
  const dispatch = useDispatch()
  const { projects, templates, loading, error } = useSelector((state: RootState) => state.project)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [form] = Form.useForm()
  const [templateForm] = Form.useForm()

  const showDetailModal = (project: any) => {
    setCurrentProject(project)
    setIsDetailModalVisible(true)
  }

  const handleDetailCancel = () => {
    setIsDetailModalVisible(false)
  }

  useEffect(() => {
    dispatch(getProjects())
    dispatch(getTemplates())
  }, [dispatch])

  const showAddModal = () => {
    setIsEditMode(false)
    setCurrentProject(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (project: any) => {
    setIsEditMode(true)
    setCurrentProject(project)
    form.setFieldsValue(project)
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleTemplateCancel = () => {
    setIsTemplateModalVisible(false)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (isEditMode) {
        await dispatch(updateProject({ id: currentProject._id, projectData: values })).unwrap()
        message.success('项目信息更新成功')
      } else {
        await dispatch(createProject(values)).unwrap()
        message.success('项目创建成功')
      }
      setIsModalVisible(false)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProject(id)).unwrap()
      message.success('项目删除成功')
    } catch (err: any) {
      message.error(err || '删除失败')
    }
  }

  const handleAddTemplate = async () => {
    try {
      const values = await templateForm.validateFields()
      await dispatch(createTemplate(values)).unwrap()
      message.success('模板创建成功')
      setIsTemplateModalVisible(false)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await dispatch(deleteTemplate(id)).unwrap()
      message.success('模板删除成功')
    } catch (err: any) {
      message.error(err || '删除失败')
    }
  }

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Button type="link" onClick={() => showDetailModal(record)} style={{ padding: 0, height: 'auto' }}>
          {name}
        </Button>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (customerId: any) => {
        if (!customerId?.name) return '未知'
        return (
          <Link to="/customers" onClick={() => {
            localStorage.setItem('selectedCustomerId', customerId._id)
          }}>
            {customerId.name}
          </Link>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ordered' || status === 'completed' ? 'green' : 'blue'}>
          {status === 'ordered' || status === 'completed' ? '成交' : '咨询'}
        </Tag>
      )
    },
    {
      title: '优惠售价',
      dataIndex: 'discountPrice',
      key: 'discountPrice',
      render: (price: number) => price ? `¥${price.toFixed(2)}` : '未报价'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <div>
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} style={{ marginRight: 8 }}>
            编辑
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        </div>
      )
    }
  ]

  const templateColumns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteTemplate(record._id)}>
          删除
        </Button>
      )
    }
  ]

  const tabsItems = [
    {
      key: 'projects',
      label: '项目管理',
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="page-title">项目管理</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              添加项目
            </Button>
          </div>
          <div className="table-container">
            <Table
              columns={projectColumns}
              dataSource={projects}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </div>
        </>
      )
    },
    {
      key: 'templates',
      label: '模板管理',
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="page-title">模板管理</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsTemplateModalVisible(true)}>
              添加模板
            </Button>
          </div>
          <div className="table-container">
            <Table
              columns={templateColumns}
              dataSource={templates}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </div>
        </>
      )
    }
  ]

  return (
    <div>
      <Tabs defaultActiveKey="projects" items={tabsItems}>
      </Tabs>

      {/* 项目模态框 */}
      <Modal
        title={isEditMode ? '编辑项目' : '添加项目'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="customerId"
            label="客户"
            rules={[{ required: true, message: '请选择客户' }]}
          >
            <Select placeholder="请选择客户">
              {/* 这里应该从客户列表中获取选项，暂时使用静态选项 */}
              <Option value="1">客户1</Option>
              <Option value="2">客户2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="parameters"
            label="项目参数"
            rules={[{ required: true, message: '请输入项目参数' }]}
          >
            <Input.TextArea placeholder="请输入项目参数（JSON格式）" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Option value="pending">待处理</Option>
              <Option value="quoted">已报价</Option>
              <Option value="ordered">已下单</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 模板模态框 */}
      <Modal
        title="添加模板"
        open={isTemplateModalVisible}
        onOk={handleAddTemplate}
        onCancel={handleTemplateCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={templateForm} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="parameters"
            label="模板参数"
            rules={[{ required: true, message: '请输入模板参数' }]}
          >
            <Input.TextArea placeholder="请输入模板参数（JSON格式）" />
          </Form.Item>
        </Form>
      </Modal>

      {error && <div className="error-message">{error}</div>}

      {/* 项目详情模态框 */}
      <Modal
        title="项目详情"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        width={700}
        footer={[
          <Button key="close" onClick={handleDetailCancel}>
            关闭
          </Button>
        ]}
      >
        {currentProject && (
          <div>
            <h3>项目信息</h3>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="项目名称">{currentProject.name}</Descriptions.Item>
              <Descriptions.Item label="客户">{currentProject.customerId?.name || '未知'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={currentProject.status === 'ordered' || currentProject.status === 'completed' ? 'green' : currentProject.status === 'cancelled' ? 'red' : 'blue'}>
                  {currentProject.status === 'pending' ? '待处理' : currentProject.status === 'quoted' ? '已报价' : currentProject.status === 'ordered' ? '已下单' : currentProject.status === 'completed' ? '已完成' : '已取消'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优惠售价">{currentProject.discountPrice ? `¥${currentProject.discountPrice.toFixed(2)}` : '未报价'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(currentProject.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{new Date(currentProject.updatedAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
            
            {currentProject.parameters && (
              <div style={{ marginTop: 20 }}>
                <h3>咨询参数</h3>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="产品类型">
                    {currentProject.parameters.productType === 'sofa' ? '沙发垫' : currentProject.parameters.productType === 'curtain' ? '窗帘' : currentProject.parameters.productType || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="面料">{currentProject.parameters.material || '-'}</Descriptions.Item>
                  <Descriptions.Item label="长度">{currentProject.parameters.length ? `${currentProject.parameters.length} cm` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="宽度">{currentProject.parameters.width ? `${currentProject.parameters.width} cm` : '-'}</Descriptions.Item>
                  {currentProject.parameters.productType === 'curtain' && (
                    <Descriptions.Item label="高度">{currentProject.parameters.height ? `${currentProject.parameters.height} cm` : '-'}</Descriptions.Item>
                  )}
                  {currentProject.parameters.productType === 'sofa' && (
                    <Descriptions.Item label="厚度">{currentProject.parameters.thickness ? `${currentProject.parameters.thickness} cm` : '-'}</Descriptions.Item>
                  )}
                  <Descriptions.Item label="数量">{currentProject.parameters.quantity || '-'}</Descriptions.Item>
                  <Descriptions.Item label="特殊要求" span={2}>
                    {currentProject.parameters.requirements || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProjectPage