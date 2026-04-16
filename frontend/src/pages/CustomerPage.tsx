import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Modal, Form, Input, message, Tag, Space, Tabs, Select, InputNumber, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, FileTextOutlined } from '@ant-design/icons'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../redux/slices/customerSlice'
import type { RootState, AppDispatch } from '../redux/store'
import api from '../utils/axiosConfig'

const { Option } = Select

const CustomerPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { customers, loading, error } = useSelector((state: RootState) => state.customer)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false)
  const [isConsultModalVisible, setIsConsultModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [isOrderDetailModalVisible, setIsOrderDetailModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<any>(null)
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [customerHistory, setCustomerHistory] = useState({ projects: [], orders: [] })
  const [form] = Form.useForm()
  const [consultForm] = Form.useForm()
  const [orderForm] = Form.useForm()
  const [isOrderAddressModalVisible, setIsOrderAddressModalVisible] = useState(false)
  const [orderDataTemp, setOrderDataTemp] = useState<any>(null)
  
  // 产品类型映射
  const productTypeMap: { [key: string]: string } = {
    curtain: '窗帘',
    sofa: '沙发套',
    bedspread: '床品',
    tablecloth: '桌布',
    carpet: '地毯',
    custom: '定制'
  }
  
  // 颜色映射
  const colorMap: { [key: string]: string } = {
    white: '白色',
    black: '黑色',
    gray: '灰色',
    beige: '米色',
    blue: '蓝色',
    green: '绿色',
    red: '红色',
    yellow: '黄色',
    custom: '定制色'
  }
  
  // 沙发垫面料单价
  const getSofaMaterialPrice = (material: string): number => {
    const priceMap: { [key: string]: number } = {
      'DL0276-7A': 80,
      'JZ80429-01': 72,
      'JZ80429-04': 72,
      'JZ80535-1': 69,
      'JZ80535-5': 69,
      'SG9015-12': 61,
      'SG9015-14': 61,
      'SG9015-22': 61,
      '016S0070344-003': 85,
      '016S0070344-004': 85,
      '016S0070344-013': 85,
      '016S0070344-014': 85,
      'JZ80525-粉色': 62,
      'JZ80525-杏色': 62
    };
    return priceMap[material] || 0;
  }
  
  // 窗帘面料单价（窗帘价格体系与沙发垫不同）
  const getCurtainMaterialPrice = (material: string): number => {
    const priceMap: { [key: string]: number } = {
      'YL-4-08': 114,
      'YL-4-06': 114,
      'YL-3-02': 77,
      'YL-3-06': 77,
      'X01-5112118-5': 157,
      'X01-5112118-4': 157,
      'X01-4112118-1': 157,
      'X01-3112118-1': 157
    };
    return priceMap[material] || 0;
  }
  
  // 计算沙发垫体积重量（长×宽×厚/12000，单位：千克）
  const calculateSofaVolumeWeight = (length: number, width: number, thickness: number): number => {
    if (!length || !width || !thickness) return 0;
    return (length * width * thickness) / 12000;
  }
  
  // 计算窗帘重量（长度×高度×0.11，单位：千克）
  const calculateCurtainWeight = (length: number, height: number): number => {
    if (!length || !height) return 0;
    return length * height * 0.11;
  }
  
  // 计算运费
  const calculateShipping = (weight: number): number => {
    const w = Math.max(weight, 0);
    if (w <= 1) {
      return 22;
    }
    return 22 + Math.ceil((w - 1) * 2) * 8;
  }
  
  // 计算窗帘布料用量（单位：米）
  const calculateCurtainFabricUsage = (length: number, height: number): number => {
    if (!length || !height) return 0;
    
    const len = Math.max(length, 0);
    const h = Math.max(height, 0);
    
    if (h > 2.7) {
      return Math.ceil((2 * len) / 2.8) * (h + 0.3) + 0.3;
    } else {
      return 2 * len + 0.3;
    }
  }
  
  // 手工费查找表
  const laborCostTable: { [key: string]: { [key: string]: number } } = {
    '3': {
      '100-70': 90, '100-90': 107, '100-110': 128, '100-130': 144,
      '110-70': 95, '110-90': 114, '110-110': 137, '110-130': 158,
      '120-70': 103, '120-90': 127, '120-110': 150, '120-130': 171,
      '130-70': 107, '130-90': 134, '130-110': 160, '130-130': 185,
      '140-70': 114, '140-90': 143, '140-110': 171, '140-130': 201,
      '150-70': 119, '150-90': 153, '150-110': 182, '150-130': 212,
      '160-70': 132, '160-90': 164, '160-110': 196, '160-130': 230,
      '170-70': 137, '170-90': 171, '170-110': 208, '170-130': 242,
      '180-70': 143, '180-90': 182, '180-110': 219, '180-130': 258,
      '190-70': 148, '190-90': 189, '190-110': 230, '190-130': 269,
      '200-70': 160, '200-90': 201, '200-110': 244, '200-130': 287,
      '210-70': 165, '210-90': 210, '210-110': 256, '210-130': 299,
      '220-70': 172, '220-90': 219, '220-110': 267, '220-130': 314,
      '230-70': 176, '230-90': 226, '230-110': 276, '230-130': 326,
      '240-70': 186, '240-90': 238, '240-110': 290, '240-130': 339,
      '250-70': 191, '250-90': 245, '250-110': 299, '250-130': 350,
      '260-70': 197, '260-90': 256, '260-110': 312, '260-130': 364,
      '270-70': 202, '270-90': 263, '270-110': 322, '270-130': 375,
      '280-70': 212, '280-90': 273, '280-110': 333, '280-130': 389,
      '290-70': 217, '290-90': 282, '290-110': 342, '290-130': 403,
      '300-70': 224, '300-90': 291, '300-110': 354, '300-130': 416
    },
    '5': {
      '100-70': 104, '100-90': 125, '100-110': 149, '100-130': 169,
      '110-70': 110, '110-90': 134, '110-110': 160, '110-130': 185,
      '120-70': 119, '120-90': 148, '120-110': 176, '120-130': 201,
      '130-70': 125, '130-90': 157, '130-110': 187, '130-130': 217,
      '140-70': 133, '140-90': 168, '140-110': 200, '140-130': 236,
      '150-70': 139, '150-90': 179, '150-110': 214, '150-130': 250,
      '160-70': 154, '160-90': 192, '160-110': 230, '160-130': 271,
      '170-70': 160, '170-90': 200, '170-110': 244, '170-130': 285,
      '180-70': 168, '180-90': 214, '180-110': 257, '180-130': 303,
      '190-70': 174, '190-90': 222, '190-110': 271, '190-130': 317,
      '200-70': 187, '200-90': 236, '200-110': 287, '200-130': 338,
      '210-70': 193, '210-90': 247, '210-110': 300, '210-130': 352,
      '220-70': 201, '220-90': 257, '220-110': 314, '220-130': 370,
      '230-70': 207, '230-90': 266, '230-110': 325, '230-130': 384,
      '240-70': 218, '240-90': 279, '240-110': 341, '240-130': 400,
      '250-70': 223, '250-90': 288, '250-110': 352, '250-130': 414,
      '260-70': 231, '260-90': 301, '260-110': 368, '260-130': 430,
      '270-70': 237, '270-90': 309, '270-110': 379, '270-130': 443,
      '280-70': 248, '280-90': 320, '280-110': 392, '280-130': 459,
      '290-70': 254, '290-90': 331, '290-110': 403, '290-130': 476,
      '300-70': 262, '300-90': 342, '300-110': 417, '300-130': 492
    }
  };
  
  // 获取手工费（根据长度、宽度、厚度）
  const getLaborCost = (length: number, width: number, thickness: number): number | string => {
    if (!length || !width || !thickness) return 0;
    
    // 长度向上取整到最接近的10的倍数（100-300）
    let roundedLength = Math.ceil(length / 10) * 10;
    if (roundedLength < 100) roundedLength = 100;
    if (roundedLength > 300) return '长度超范围（仅支持100-300cm）';
    
    // 宽度向上取整到指定档位（70, 90, 110, 130）
    const widthOptions = [70, 90, 110, 130];
    let roundedWidth = widthOptions.find(w => w >= width) || 130;
    if (width > 130) return '宽度超范围（仅支持≤130cm）';
    
    const key = `${roundedLength}-${roundedWidth}`;
    const table = laborCostTable[String(thickness)];
    
    if (table && table[key]) {
      return table[key];
    }
    
    return '未找到匹配的手工费';
  }
  
  // 计算布料用量（厘米）
  const calculateFabricUsage = (length: number, width: number): number | string => {
    if (!length || !width) return 0;
    
    const len = Math.max(length, 0);
    
    if (width <= 60) {
      return Math.ceil((len + 40) / 50) * 50;
    } else if (width <= 130) {
      return Math.ceil((len * 2 + 40) / 50) * 50;
    } else {
      return '宽度超范围（仅支持≤130cm）';
    }
  }
  
  
  
  const getCustomerHistory = async (customerId: string) => {
    try {
      const response = await api.get(`/customers/${customerId}/history`)
      setCustomerHistory(response.data)
      setIsHistoryModalVisible(true)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取客户历史记录失败')
    }
  }
  
  const showConsultModal = (customer: any) => {
    setCurrentCustomer(customer)
    consultForm.resetFields()
    setIsConsultModalVisible(true)
  }
  
  const handleConsultCancel = () => {
    setIsConsultModalVisible(false)
  }
  
  const showProjectDetail = (project: any) => {
    setCurrentProject(project)
    setIsDetailModalVisible(true)
  }
  
  const handleDetailCancel = () => {
    setIsDetailModalVisible(false)
  }
  
  const showOrderDetail = async (order: any) => {
    try {
      const response = await api.get(`/orders/${order._id}`)
      setCurrentOrder(response.data.order)
      setIsOrderDetailModalVisible(true)
    } catch (err: any) {
      message.error(err || '获取订单详情失败')
    }
  }
  
  const handleOrderDetailCancel = () => {
    setIsOrderDetailModalVisible(false)
  }
  
  const handleConsultOk = async () => {
    try {
      const values = await consultForm.validateFields()
      
      // 构建项目参数对象
      const parameters = {
        productType: values.productType,
        material: values.material,
        color: values.color,
        length: values.length,
        width: values.width,
        height: values.height,
        thickness: values.thickness,
        quantity: values.quantity,
        requirements: values.requirements,
        estimatedPrice: values.estimatedPrice // 系统计算的预估售价
      }
      
      // 创建项目（咨询记录）
      const projectData = {
        customerId: currentCustomer._id,
        name: values.projectName,
        parameters,
        discountPrice: values.discountPrice, // 优惠售价
        status: 'pending'
      }
      
      await api.post('/projects', projectData)
      message.success('咨询记录创建成功')
      
      // 创建成功后，自动获取并显示客户的历史记录
      await getCustomerHistory(currentCustomer._id)
      
      setIsConsultModalVisible(false)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  const handleConsultToOrder = async () => {
    try {
      const values = await consultForm.validateFields()
      
      const parameters = {
        productType: values.productType,
        material: values.material,
        color: values.color,
        length: values.length,
        width: values.width,
        height: values.height,
        thickness: values.thickness,
        quantity: values.quantity,
        requirements: values.requirements,
        estimatedPrice: values.estimatedPrice
      }
      
      const projectData = {
        customerId: currentCustomer._id,
        name: values.projectName,
        parameters,
        discountPrice: values.discountPrice,
        status: 'ordered'
      }
      
      const projectResponse = await api.post('/projects', projectData)
      const project = projectResponse.data.project
      
      setOrderDataTemp({
        customerId: currentCustomer._id,
        projectId: project._id,
        totalAmount: values.discountPrice
      })
      
      orderForm.resetFields()
      setIsConsultModalVisible(false)
      setIsOrderAddressModalVisible(true)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  const convertToOrder = async (project: any) => {
    try {
      await api.put(`/projects/${project._id}`, {
        status: 'ordered'
      })
      
      setOrderDataTemp({
        customerId: project.customerId._id || project.customerId,
        projectId: project._id,
        totalAmount: project.discountPrice || project.finalPrice || 0,
        originalProject: project
      })
      
      orderForm.resetFields()
      setIsOrderAddressModalVisible(true)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  const handleOrderAddressSubmit = async () => {
    try {
      const addressValues = await orderForm.validateFields()
      
      if (!orderDataTemp) {
        message.error('订单数据异常')
        return
      }
      
      const orderData = {
        customerId: orderDataTemp.customerId,
        projectId: orderDataTemp.projectId,
        totalAmount: orderDataTemp.totalAmount,
        status: 'ordered',
        receiverName: addressValues.receiverName,
        receiverPhone: addressValues.receiverPhone,
        receiverAddress: addressValues.receiverAddress
      }
      
      await api.post('/orders', orderData)
      message.success('订单创建成功')
      
      if (currentCustomer) {
        await getCustomerHistory(currentCustomer._id)
      }
      
      if (orderDataTemp.originalProject) {
        setCurrentProject({ ...orderDataTemp.originalProject, status: 'ordered' })
      }
      
      setIsOrderAddressModalVisible(false)
      setOrderDataTemp(null)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  useEffect(() => {
    dispatch(getCustomers())
    
    const selectedCustomerId = localStorage.getItem('selectedCustomerId')
    if (selectedCustomerId) {
      getCustomerHistory(selectedCustomerId)
      localStorage.removeItem('selectedCustomerId')
    }
  }, [dispatch])

  const showAddModal = async () => {
    setIsEditMode(false)
    setCurrentCustomer(null)
    form.resetFields()
    
    try {
      const response = await api.get('/customers/generate-id')
      form.setFieldsValue({ customerId: response.data.customerId })
    } catch (error) {
      console.error('Error generating customer ID:', error)
    }
    
    setIsModalVisible(true)
  }

  const showEditModal = (customer: any) => {
    setIsEditMode(true)
    setCurrentCustomer(customer)
    form.setFieldsValue(customer)
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      
      const customerData = {
        ...values
      }
      
      if (isEditMode) {
        await dispatch(updateCustomer({ id: currentCustomer._id, customerData })).unwrap()
        message.success('客户信息更新成功')
      } else {
        await dispatch(createCustomer(customerData)).unwrap()
        message.success('客户创建成功')
      }
      
      dispatch(getCustomers())
      setIsModalVisible(false)
    } catch (err: any) {
      message.error(err || '操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteCustomer(id)).unwrap()
      message.success('客户删除成功')
    } catch (err: any) {
      message.error(err || '删除失败')
    }
  }

  const columns = [
    {
      title: '客户ID',
      dataIndex: 'customerId',
      key: 'customerId',
      width: 100
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 110
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      width: 150
    },
    {
      title: '累计消费',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      align: 'right' as const,
      render: (amount: number) => amount ? `¥${amount.toFixed(2)}` : '¥0.00'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            编辑
          </Button>
          <Button size="small" icon={<FileTextOutlined />} onClick={() => showConsultModal(record)}>
            咨询
          </Button>
          <Button size="small" icon={<HistoryOutlined />} onClick={() => getCustomerHistory(record._id)}>
            历史
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const filteredCustomers = customers.filter(customer => {
    const name = customer.name || '';
    const phone = customer.phone || '';
    const customerId = customer.customerId || '';
    return (
      name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      phone.includes(searchKeyword) ||
      customerId.includes(searchKeyword)
    );
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title">客户管理</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索客户名称、电话或ID"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            添加客户
          </Button>
        </div>
      </div>
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
      <Modal
        title={isEditMode ? '编辑客户' : '添加客户'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="customerId"
            label="客户ID"
          >
            <Input placeholder="请输入客户ID" disabled={!isEditMode} />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="remark"
            label="客户备注"
          >
            <Input.TextArea rows={3} placeholder="记录客户需求和偏好等信息" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 添加咨询记录模态框 */}
      <Modal
        title={`为 ${currentCustomer?.name || ''} 添加咨询记录`}
        open={isConsultModalVisible}
        onOk={handleConsultOk}
        onCancel={handleConsultCancel}
        okText="保存"
        cancelText="取消"
        width={800}
        footer={[
          <Button key="back" onClick={handleConsultCancel}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleConsultOk}>保存</Button>,
          <Button key="order" type="primary" danger onClick={handleConsultToOrder}>直接成交</Button>,
        ]}
      >
        <Form form={consultForm} layout="vertical">
          <Form.Item
            name="projectName"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称，如：客厅窗帘咨询" />
          </Form.Item>
          
          <Form.Item
            name="productType"
            label="产品类型"
            rules={[{ required: true, message: '请选择产品类型' }]}
          >
            <Select placeholder="请选择产品类型">
              <Option value="sofa">沙发垫</Option>
              <Option value="curtain">窗帘</Option>
            </Select>
          </Form.Item>
          
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.productType !== currentValues.productType}>
            {({ getFieldValue }) => {
              const productType = getFieldValue('productType');
              if (productType === 'sofa') {
                return (
                  <Form.Item
                    name="material"
                    label="面料"
                    rules={[{ required: true, message: '请选择面料' }]}
                  >
                    <Select placeholder="请选择面料" showSearch>
                      <Option value="DL0276-7A">DL0276-7A 土黄 - ¥80</Option>
                      <Option value="JZ80429-01">JZ80429-01 白色 - ¥72</Option>
                      <Option value="JZ80429-04">JZ80429-04 雨露麻 - ¥72</Option>
                      <Option value="JZ80535-1">JZ80535-1 白蓝条 - ¥69</Option>
                      <Option value="JZ80535-5">JZ80535-5 黄蓝条 - ¥69</Option>
                      <Option value="SG9015-12">SG9015-12 亚麻格子 - ¥61</Option>
                      <Option value="SG9015-14">SG9015-14 咖格子 - ¥61</Option>
                      <Option value="SG9015-22">SG9015-22 绿格子 - ¥61</Option>
                      <Option value="016S0070344-003">016S0070344-003 黑白宽条 - ¥85</Option>
                      <Option value="016S0070344-004">016S0070344-004 米白宽条 - ¥85</Option>
                      <Option value="016S0070344-013">016S0070344-013 黑白细条 - ¥85</Option>
                      <Option value="016S0070344-014">016S0070344-014 米白细条 - ¥85</Option>
                      <Option value="JZ80525-粉色">JZ80525-粉色 - ¥62</Option>
                      <Option value="JZ80525-杏色">JZ80525-杏色 - ¥62</Option>
                    </Select>
                  </Form.Item>
                );
              } else if (productType === 'curtain') {
                return (
                  <Form.Item
                    name="material"
                    label="面料"
                    rules={[{ required: true, message: '请选择面料' }]}
                  >
                    <Select placeholder="请选择面料" showSearch>
                      <Option value="YL-4-08">YL-4-08 - ¥114</Option>
                      <Option value="YL-4-06">YL-4-06 - ¥114</Option>
                      <Option value="YL-3-02">YL-3-02 - ¥77</Option>
                      <Option value="YL-3-06">YL-3-06 - ¥77</Option>
                      <Option value="X01-5112118-5">X01-5112118-5 - ¥157</Option>
                      <Option value="X01-5112118-4">X01-5112118-4 - ¥157</Option>
                      <Option value="X01-4112118-1">X01-4112118-1 - ¥157</Option>
                      <Option value="X01-3112118-1">X01-3112118-1 - ¥157</Option>
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          
          {/* 窗帘颜色选择（沙发垫颜色由面料决定） */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.productType !== currentValues.productType}>
            {({ getFieldValue }) => {
              const productType = getFieldValue('productType');
              if (productType === 'curtain') {
                return (
                  <Form.Item
                    name="color"
                    label="颜色"
                    rules={[{ required: true, message: '请选择颜色' }]}
                  >
                    <Select placeholder="请选择颜色">
                      <Option value="white">白色</Option>
                      <Option value="black">黑色</Option>
                      <Option value="gray">灰色</Option>
                      <Option value="beige">米色</Option>
                      <Option value="blue">蓝色</Option>
                      <Option value="green">绿色</Option>
                      <Option value="red">红色</Option>
                      <Option value="yellow">黄色</Option>
                      <Option value="custom">定制色</Option>
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          
          {/* 沙发垫尺寸 */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.productType !== currentValues.productType}>
            {({ getFieldValue }) => {
              const productType = getFieldValue('productType');
              if (productType === 'sofa') {
                return (
                  <div>
                    <Form.Item label="沙发垫尺寸（厘米）">
                      <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="length" rules={[{ required: true, message: '请输入长度' }]} style={{ marginBottom: 0, width: '30%' }}>
                          <InputNumber placeholder="长度" min={1} />
                        </Form.Item>
                        <Form.Item name="width" rules={[{ required: true, message: '请输入宽度' }]} style={{ marginBottom: 0, width: '30%' }}>
                          <InputNumber placeholder="宽度" min={1} />
                        </Form.Item>
                        <Form.Item name="thickness" rules={[{ required: true, message: '请选择厚度' }]} style={{ marginBottom: 0, width: '30%' }}>
                          <Select placeholder="请选择厚度">
                            <Option value={3}>3cm</Option>
                            <Option value={5}>5cm</Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </Form.Item>
                  </div>
                );
              }
              return null;
            }}
          </Form.Item>
          
          {/* 窗帘尺寸 */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.productType !== currentValues.productType}>
            {({ getFieldValue }) => {
              const productType = getFieldValue('productType');
              if (productType === 'curtain') {
                return (
                  <div>
                    <Form.Item label="窗帘尺寸（厘米）">
                      <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="length" rules={[{ required: true, message: '请输入长度' }]} style={{ marginBottom: 0, width: '45%' }}>
                          <InputNumber placeholder="长度" min={1} />
                        </Form.Item>
                        <Form.Item name="height" rules={[{ required: true, message: '请输入高度' }]} style={{ marginBottom: 0, width: '45%' }}>
                          <InputNumber placeholder="高度" min={1} />
                        </Form.Item>
                      </div>
                    </Form.Item>
                  </div>
                );
              }
              return null;
            }}
          </Form.Item>
          
          <Form.Item
            name="quantity"
            label="数量"
            initialValue={1}
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber placeholder="请输入数量" min={1} />
          </Form.Item>
          
          {/* 自动计算价格 */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const productType = getFieldValue('productType');
              const material = getFieldValue('material');
              const length = getFieldValue('length');
              const width = getFieldValue('width');
              const height = getFieldValue('height');
              const thickness = getFieldValue('thickness');
              const quantity = getFieldValue('quantity');
              
              // 价格计算
              let calculatedPrice = null;
              let costPrice = null;
              let shipping = null;
              let weight = null;
              let laborCost = null;
              let fabricUsage = null;
              let fabricCost = null;
              let materialPrice = null;
              
              if (productType === 'sofa' && material && length && width && thickness && quantity) {
                // 体积重量 = 长 × 宽 × 厚 / 12000
                weight = calculateSofaVolumeWeight(length, width, thickness);
                
                // 运费计算
                shipping = calculateShipping(weight);
                
                // 手工费
                laborCost = getLaborCost(length, width, thickness);
                
                // 布料用量（厘米）
                fabricUsage = calculateFabricUsage(length, width);
                
                // 面料单价
                materialPrice = getSofaMaterialPrice(material);
                
                // 布料费用 = 布料用量(米) × 面料单价
                if (typeof fabricUsage === 'number') {
                  fabricCost = ((fabricUsage / 100) * materialPrice * quantity).toFixed(2);
                }
                
                // 出厂成本 = 手工费 + 布料费用
                if (typeof laborCost === 'number' && fabricCost) {
                  costPrice = (laborCost + parseFloat(fabricCost)).toFixed(2);
                }
                
                // 预估售价 = 出厂成本 × 2 + 运费
                if (costPrice) {
                  calculatedPrice = (parseFloat(costPrice) * 2 + shipping).toFixed(2);
                }
              } else if (productType === 'curtain' && material && length && height && quantity) {
                // 窗帘长度和高度转换为米
                const lengthM = length / 100;
                const heightM = height / 100;
                
                // 窗帘重量 = 长度(m) × 高度(m) × 0.11
                weight = calculateCurtainWeight(lengthM, heightM);
                
                // 运费计算
                shipping = calculateShipping(weight);
                
                // 窗帘布料用量
                fabricUsage = calculateCurtainFabricUsage(lengthM, heightM);
                
                // 窗帘面料单价
                materialPrice = getCurtainMaterialPrice(material);
                
                // 出厂成本 = (布料单价 + 20) × 布料用量
                costPrice = ((materialPrice + 20) * fabricUsage * quantity).toFixed(2);
                
                // 预估售价 = 出厂成本 × 2.5 + 运费
                calculatedPrice = (parseFloat(costPrice) * 2.5 + shipping).toFixed(2);
              }
              
              if (calculatedPrice) {
                return (
                  <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    {productType === 'sofa' && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#666' }}>体积重量：</span>
                          <span>{weight?.toFixed(4)} 千克</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#666' }}>运费：</span>
                          <span>¥{shipping?.toFixed(2)}</span>
                        </div>
                        <div style={{ borderTop: '1px dashed #ccc', paddingTop: 8, marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: '#666' }}>手工费：</span>
                            <span>{typeof laborCost === 'number' ? `¥${laborCost}` : laborCost}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: '#666' }}>布料用量：</span>
                            <span>{typeof fabricUsage === 'number' ? `${fabricUsage} 厘米` : fabricUsage}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: '#666' }}>布料费用：</span>
                            <span>{fabricCost ? `¥${fabricCost}` : '-'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', fontWeight: 'bold' }}>出厂成本：</span>
                            <span style={{ fontWeight: 'bold' }}>{costPrice ? `¥${costPrice}` : '-'}</span>
                          </div>
                        </div>
                        <div style={{ borderTop: '1px dashed #ccc', paddingTop: 8, marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>预估售价：</span>
                            <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>¥{calculatedPrice}</span>
                          </div>
                        </div>
                        <div style={{ borderTop: '2px solid #1890ff', paddingTop: 12, backgroundColor: '#f0f8ff', padding: 12, borderRadius: 4 }}>
                          <Form.Item name="estimatedPrice" initialValue={parseFloat(calculatedPrice)} style={{ display: 'none' }}>
                            <Input />
                          </Form.Item>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>优惠售价：</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>¥</span>
                              <Form.Item name="discountPrice" style={{ marginBottom: 0, width: 150 }}>
                                <InputNumber 
                                  placeholder="输入优惠售价" 
                                  min={0} 
                                  step={0.01} 
                                  style={{ width: '100%', fontSize: 24 }}
                                  defaultValue={parseFloat(calculatedPrice)}
                                />
                              </Form.Item>
                            </div>
                          </div>
                          <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                            注：客服可根据实际情况调整优惠售价
                          </p>
                        </div>
                      </div>
                    )}
                    {productType === 'curtain' && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#666' }}>重量：</span>
                          <span>{weight?.toFixed(4)} 千克</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#666' }}>运费：</span>
                          <span>¥{shipping?.toFixed(2)}</span>
                        </div>
                        <div style={{ borderTop: '1px dashed #ccc', paddingTop: 8, marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: '#666' }}>面料单价：</span>
                            <span>{materialPrice && typeof materialPrice === 'number' ? `¥${materialPrice.toFixed(2)}/米` : '未配置'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ color: '#666' }}>布料用量：</span>
                            <span>{typeof fabricUsage === 'number' ? fabricUsage.toFixed(2) : fabricUsage} 米</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', fontWeight: 'bold' }}>出厂成本：</span>
                            <span style={{ fontWeight: 'bold' }}>{costPrice ? `¥${costPrice}` : '-'}</span>
                          </div>
                        </div>
                        <div style={{ borderTop: '1px dashed #ccc', paddingTop: 8, marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>预估售价：</span>
                            <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>¥{calculatedPrice}</span>
                          </div>
                        </div>
                        <div style={{ borderTop: '2px solid #1890ff', paddingTop: 12, backgroundColor: '#f0f8ff', padding: 12, borderRadius: 4 }}>
                          <Form.Item name="estimatedPrice" initialValue={parseFloat(calculatedPrice)} style={{ display: 'none' }}>
                            <Input />
                          </Form.Item>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>优惠售价：</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>¥</span>
                              <Form.Item name="discountPrice" style={{ marginBottom: 0, width: 150 }}>
                                <InputNumber 
                                  placeholder="输入优惠售价" 
                                  min={0} 
                                  step={0.01} 
                                  style={{ width: '100%', fontSize: 24 }}
                                  defaultValue={parseFloat(calculatedPrice)}
                                />
                              </Form.Item>
                            </div>
                          </div>
                          <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                            注：客服可根据实际情况调整优惠售价
                          </p>
                        </div>
                      </div>
                    )}
                    <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                      注：以上价格为预估价格，实际价格可能因工艺要求、市场行情等因素有所调整
                    </p>
                  </div>
                );
              }
              return null;
            }}
          </Form.Item>
          
          <Form.Item
            name="requirements"
            label="特殊要求"
          >
            <Input.TextArea placeholder="请描述客户的特殊要求或备注信息" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 历史记录模态框 */}
      <Modal
        title="客户历史记录"
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsHistoryModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Tabs 
          defaultActiveKey="projects" 
          items={[
            {
              key: 'projects',
              label: '咨询记录',
              children: customerHistory.projects && customerHistory.projects.length > 0 ? (
                <Table
                  dataSource={customerHistory.projects}
                  rowKey="_id"
                  columns={[
                    {
                      title: '项目名称',
                      dataIndex: 'name',
                      key: 'name'
                    },
                    {
                      title: '产品类型',
                      dataIndex: 'parameters',
                      key: 'productType',
                      render: (params: any) => params?.productType ? productTypeMap[params.productType] || params.productType : '-'
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={status === 'ordered' ? 'green' : status === 'pending' ? 'blue' : 'red'}>
                          {status === 'pending' ? '待处理' : status === 'quoted' ? '已报价' : status === 'ordered' ? '已下单' : status === 'completed' ? '已完成' : '已取消'}
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
                      title: '创建时间',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (time: string) => new Date(time).toLocaleString()
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_: any, record: any) => (
                        <Button type="primary" onClick={() => showProjectDetail(record)}>
                          查看详情
                        </Button>
                      )
                    }
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>暂无咨询记录</div>
              )
            },
            {
              key: 'orders',
              label: '成交记录',
              children: customerHistory.orders && customerHistory.orders.length > 0 ? (
                <Table
                  dataSource={customerHistory.orders}
                  rowKey="_id"
                  columns={[
                    {
                      title: '订单编号',
                      dataIndex: 'orderNumber',
                      key: 'orderNumber'
                    },
                    {
                      title: '项目名称',
                      dataIndex: 'projectId',
                      key: 'projectId',
                      render: (project: any) => project ? project.name : '未知项目'
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={status === 'completed' ? 'green' : status === 'ordered' ? 'blue' : status === 'processing' ? 'orange' : status === 'pending' ? 'cyan' : 'red'}>
                          {status === 'pending' ? '待处理' : status === 'ordered' ? '已下单' : status === 'processing' ? '处理中' : status === 'completed' ? '已完成' : '已取消'}
                        </Tag>
                      )
                    },
                    {
                      title: '总金额',
                      dataIndex: 'totalAmount',
                      key: 'totalAmount',
                      render: (amount: number) => `¥${amount.toFixed(2)}`
                    },
                    {
                      title: '创建时间',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (time: string) => new Date(time).toLocaleString()
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_: any, record: any) => (
                        <Button type="primary" onClick={() => showOrderDetail(record)}>
                          查看详情
                        </Button>
                      )
                    }
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>暂无成交记录</div>
              )
            }
          ]}
        />
      </Modal>
      
      {/* 咨询记录详情模态框 */}
      <Modal
        title="咨询记录详情"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        width={600}
        footer={[
          <Button key="close" onClick={handleDetailCancel}>
            关闭
          </Button>,
          currentProject && currentProject.status !== 'ordered' && (
            <Button key="order" type="primary" danger onClick={() => convertToOrder(currentProject)}>
              转为订单
            </Button>
          )
        ]}
      >
        {currentProject && (
          <div>
            <h3>项目信息</h3>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="项目名称">{currentProject.name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={currentProject.status === 'ordered' ? 'green' : currentProject.status === 'pending' ? 'blue' : 'red'}>
                  {currentProject.status === 'pending' ? '待处理' : currentProject.status === 'quoted' ? '已报价' : currentProject.status === 'ordered' ? '已下单' : currentProject.status === 'completed' ? '已完成' : '已取消'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预估售价">{currentProject.parameters?.estimatedPrice ? `¥${currentProject.parameters.estimatedPrice.toFixed(2)}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="优惠售价">{currentProject.discountPrice ? `¥${currentProject.discountPrice.toFixed(2)}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(currentProject.createdAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
            
            <h3 style={{ marginTop: 20 }}>咨询参数</h3>
            {currentProject.parameters && (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="产品类型">
                  {currentProject.parameters.productType === 'sofa' ? '沙发垫' : currentProject.parameters.productType === 'curtain' ? '窗帘' : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="面料">
                  {currentProject.parameters.material ? currentProject.parameters.material : '-'}
                </Descriptions.Item>
                {currentProject.parameters.productType === 'curtain' && (
                  <Descriptions.Item label="颜色">
                    {currentProject.parameters.color ? colorMap[currentProject.parameters.color] || currentProject.parameters.color : '-'}
                  </Descriptions.Item>
                )}
                {currentProject.parameters.productType === 'sofa' && (
                  <Descriptions.Item label="厚度">
                    {currentProject.parameters.thickness ? `${currentProject.parameters.thickness} cm` : '-'}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="长度">{currentProject.parameters.length ? `${currentProject.parameters.length} cm` : '-'}</Descriptions.Item>
                <Descriptions.Item label="宽度">{currentProject.parameters.width ? `${currentProject.parameters.width} cm` : '-'}</Descriptions.Item>
                {currentProject.parameters.productType === 'curtain' && (
                  <Descriptions.Item label="高度">{currentProject.parameters.height ? `${currentProject.parameters.height} cm` : '-'}</Descriptions.Item>
                )}
                <Descriptions.Item label="数量">{currentProject.parameters.quantity ? currentProject.parameters.quantity : '-'}</Descriptions.Item>
                <Descriptions.Item label="特殊要求" span={2}>
                  {currentProject.parameters.requirements || '-'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>
      
      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={isOrderDetailModalVisible}
        onCancel={handleOrderDetailCancel}
        width={700}
        footer={[
          <Button key="close" onClick={handleOrderDetailCancel}>
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
                <Tag color={currentOrder.status === 'completed' ? 'green' : currentOrder.status === 'ordered' ? 'blue' : currentOrder.status === 'processing' ? 'orange' : currentOrder.status === 'pending' ? 'cyan' : 'red'}>
                  {currentOrder.status === 'pending' ? '待处理' : currentOrder.status === 'ordered' ? '已下单' : currentOrder.status === 'processing' ? '处理中' : currentOrder.status === 'completed' ? '已完成' : '已取消'}
                </Tag>
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
                  <Descriptions.Item label="状态">
                    <Tag color={currentOrder.projectId.status === 'ordered' || currentOrder.projectId.status === 'completed' ? 'green' : currentOrder.projectId.status === 'quoted' ? 'blue' : 'orange'}>
                      {currentOrder.projectId.status === 'pending' ? '待处理' : currentOrder.projectId.status === 'quoted' ? '已报价' : currentOrder.projectId.status === 'ordered' ? '已下单' : currentOrder.projectId.status === 'completed' ? '已完成' : '已取消'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="预估售价">{currentOrder.projectId.parameters?.estimatedPrice ? `¥${currentOrder.projectId.parameters.estimatedPrice.toFixed(2)}` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="优惠售价">{currentOrder.projectId.discountPrice ? `¥${currentOrder.projectId.discountPrice.toFixed(2)}` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{new Date(currentOrder.projectId.createdAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>
                
                <h3 style={{ marginTop: 20 }}>咨询参数</h3>
                {currentOrder.projectId.parameters && (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="产品类型">
                      {currentOrder.projectId.parameters.productType === 'sofa' ? '沙发垫' : currentOrder.projectId.parameters.productType === 'curtain' ? '窗帘' : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="面料">
                      {currentOrder.projectId.parameters.material || '-'}
                    </Descriptions.Item>
                    {currentOrder.projectId.parameters.productType === 'curtain' && (
                      <Descriptions.Item label="颜色">
                        {currentOrder.projectId.parameters.color ? colorMap[currentOrder.projectId.parameters.color] || currentOrder.projectId.parameters.color : '-'}
                      </Descriptions.Item>
                    )}
                    {currentOrder.projectId.parameters.productType === 'sofa' && (
                      <Descriptions.Item label="厚度">
                        {currentOrder.projectId.parameters.thickness ? `${currentOrder.projectId.parameters.thickness} cm` : '-'}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="长度">{currentOrder.projectId.parameters.length ? `${currentOrder.projectId.parameters.length} cm` : '-'}</Descriptions.Item>
                    <Descriptions.Item label="宽度">{currentOrder.projectId.parameters.width ? `${currentOrder.projectId.parameters.width} cm` : '-'}</Descriptions.Item>
                    {currentOrder.projectId.parameters.productType === 'curtain' && (
                      <Descriptions.Item label="高度">{currentOrder.projectId.parameters.height ? `${currentOrder.projectId.parameters.height} cm` : '-'}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="数量">{currentOrder.projectId.parameters.quantity || '-'}</Descriptions.Item>
                    <Descriptions.Item label="特殊要求" span={2}>
                      {currentOrder.projectId.parameters.requirements || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </div>
            )}
          </div>
        )})
      </Modal>
      
      {/* 收货信息模态框 */}
      <Modal
        title="填写收货信息"
        open={isOrderAddressModalVisible}
        onCancel={() => setIsOrderAddressModalVisible(false)}
        width={500}
        footer={[
          <Button key="back" onClick={() => setIsOrderAddressModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleOrderAddressSubmit}>确认提交</Button>,
        ]}
      >
        <Form form={orderForm} layout="vertical">
          <Form.Item
            name="receiverName"
            label="收货人"
            rules={[{ required: true, message: '请输入收货人' }]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item
            name="receiverPhone"
            label="收货电话"
            rules={[{ required: true, message: '请输入收货电话' }]}
          >
            <Input placeholder="请输入收货电话" />
          </Form.Item>
          <Form.Item
            name="receiverAddress"
            label="收货地址"
            rules={[{ required: true, message: '请输入收货地址' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入详细收货地址" />
          </Form.Item>
        </Form>
      </Modal>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default CustomerPage