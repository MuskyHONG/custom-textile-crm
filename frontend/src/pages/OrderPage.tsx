import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Modal, Form, Input, message, Select, Space, Tag, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getOrders, createOrder, updateOrderStatus, cancelOrder } from '../redux/slices/orderSlice'
import type { RootState } from '../redux/store'
import { Link } from 'react-router-dom'

const { Option } = Select

const OrderPage: React.FC = () => {
  const dispatch = useDispatch()
  const { orders, loading, error } = useSelector((state: RootState) => state.order)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [form] = Form.useForm()
  const [cancelReason, setCancelReason] = useState('')

  const showDetailModal = (order: any) => {
    setCurrentOrder(order)
    setIsDetailModalVisible(true)
  }

  const handleDetailCancel = () => {
    setIsDetailModalVisible(false)
  }

  useEffect(() => {
    dispatch(getOrders())
  }, [dispatch])

  const showAddModal = () => {
    setCurrentOrder(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showCancelModal = (order: any) => {
    setCurrentOrder(order)
    setCancelReason('')
    setIsCancelModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleCancelOrderModal = () => {
    setIsCancelModalVisible(false)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await dispatch(createOrder(values)).unwrap()
      message.success('订单创建成功')
      setIsModalVisible(false)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  const handleCancelOrder = async () => {
    try {
      await dispatch(cancelOrder({ id: currentOrder._id, reason: cancelReason })).unwrap()
      message.success('订单取消成功')
      setIsCancelModalVisible(false)
    } catch (err: any) {
      message.error(err || '取消失败')
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap()
      message.success('订单状态更新成功')
    } catch (err: any) {
      message.error(err || '更新失败')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'cyan'
      case 'ordered':
        return 'blue'
      case 'processing':
        return 'orange'
      case 'completed':
        return 'green'
      case 'cancelled':
        return 'red'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理'
      case 'ordered':
        return '已下单'
      case 'processing':
        return '处理中'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
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
      title: '项目',
      dataIndex: 'projectId',
      key: 'projectId',
      render: (projectId: any, record: any) => {
        if (!projectId?.name) return '未知'
        return (
          <Button type="link" onClick={() => showDetailModal(record)} style={{ padding: 0, height: 'auto' }}>
            {projectId.name}
          </Button>
        )
      }
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Select
            defaultValue={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleUpdateStatus(record._id, value)}
          >
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Button danger icon={<DeleteOutlined />} onClick={() => showCancelModal(record)}>
            取消订单
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title">订单管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          创建订单
        </Button>
      </div>
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
      <Modal
        title="创建订单"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="projectId"
            label="项目"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select placeholder="请选择项目">
              {/* 这里应该从项目列表中获取选项，暂时使用静态选项 */}
              <Option value="1">项目1</Option>
              <Option value="2">项目2</Option>
            </Select>
          </Form.Item>
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
            name="totalAmount"
            label="总金额"
            rules={[{ required: true, message: '请输入总金额' }]}
          >
            <Input type="number" placeholder="请输入总金额" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="取消订单"
        open={isCancelModalVisible}
        onOk={handleCancelOrder}
        onCancel={handleCancelOrderModal}
        okText="确认取消"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item
            label="取消原因"
            rules={[{ required: true, message: '请输入取消原因' }]}
          >
            <Input.TextArea
              placeholder="请输入取消原因"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
      {error && <div className="error-message">{error}</div>}

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        width={700}
        footer={[
          <Button key="close" onClick={handleDetailCancel}>
            关闭
          </Button>
        ]}
      >
        {currentOrder && (
          <div>
            <h3>订单信息</h3>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="订单编号">{currentOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(currentOrder.status)}>{getStatusText(currentOrder.status)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="总金额">{currentOrder.totalAmount ? `¥${currentOrder.totalAmount.toFixed(2)}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(currentOrder.createdAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
            
            <h3 style={{ marginTop: 20 }}>收货信息</h3>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="收货人">{currentOrder.receiverName || '-'}</Descriptions.Item>
              <Descriptions.Item label="收货电话">{currentOrder.receiverPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {currentOrder.receiverAddress || '-'}
              </Descriptions.Item>
            </Descriptions>
            
            {currentOrder.projectId && (
              <div style={{ marginTop: 20 }}>
                <h3>项目信息</h3>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="项目名称">{currentOrder.projectId.name}</Descriptions.Item>
                  <Descriptions.Item label="优惠售价">{currentOrder.projectId.discountPrice ? `¥${currentOrder.projectId.discountPrice.toFixed(2)}` : '-'}</Descriptions.Item>
                </Descriptions>
                
                {currentOrder.projectId.parameters && (
                  <div style={{ marginTop: 16 }}>
                    <h4>咨询参数</h4>
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="产品类型">
                        {currentOrder.projectId.parameters.productType === 'sofa' ? '沙发垫' : currentOrder.projectId.parameters.productType === 'curtain' ? '窗帘' : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="面料">{currentOrder.projectId.parameters.material || '-'}</Descriptions.Item>
                      <Descriptions.Item label="长度">{currentOrder.projectId.parameters.length ? `${currentOrder.projectId.parameters.length} cm` : '-'}</Descriptions.Item>
                      <Descriptions.Item label="宽度">{currentOrder.projectId.parameters.width ? `${currentOrder.projectId.parameters.width} cm` : '-'}</Descriptions.Item>
                      {currentOrder.projectId.parameters.productType === 'curtain' && (
                        <Descriptions.Item label="高度">{currentOrder.projectId.parameters.height ? `${currentOrder.projectId.parameters.height} cm` : '-'}</Descriptions.Item>
                      )}
                      {currentOrder.projectId.parameters.productType === 'sofa' && (
                        <Descriptions.Item label="厚度">{currentOrder.projectId.parameters.thickness ? `${currentOrder.projectId.parameters.thickness} cm` : '-'}</Descriptions.Item>
                      )}
                      <Descriptions.Item label="数量">{currentOrder.projectId.parameters.quantity || '-'}</Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderPage