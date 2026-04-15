import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Spin, Statistic } from 'antd'
import ReactECharts from 'echarts-for-react'
import api from '../utils/axiosConfig'

const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    customerCount: 0,
    projectCount: 0,
    orderCount: 0,
    totalSales: 0,
    orderStatus: {
      pending: 0,
      ordered: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    }
  })
  const [salesTrend, setSalesTrend] = useState({
    months: [],
    sales: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, trendResponse] = await Promise.all([
          api.get('/statistics'),
          api.get('/statistics/sales-trend')
        ])
        
        setStatistics(statsResponse.data)
        setSalesTrend(trendResponse.data)
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const salesTrendOption = {
    title: {
      text: '销售趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: salesTrend.months.length > 0 ? salesTrend.months : ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: salesTrend.sales.length > 0 ? salesTrend.sales : [0, 0, 0, 0, 0, 0],
        type: 'line',
        smooth: true
      }
    ]
  }

  const orderStatusOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '40%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: [
          { value: statistics.orderStatus.pending, name: '待处理', itemStyle: { color: '#1890ff' } },
          { value: statistics.orderStatus.ordered, name: '已下单', itemStyle: { color: '#52c41a' } },
          { value: statistics.orderStatus.processing, name: '处理中', itemStyle: { color: '#faad14' } },
          { value: statistics.orderStatus.completed, name: '已完成', itemStyle: { color: '#2f54eb' } },
          { value: statistics.orderStatus.cancelled, name: '已取消', itemStyle: { color: '#ff4d4f' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  const customerLevelOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        name: '订单类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '40%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: [
          { value: statistics.orderStatus.ordered + statistics.orderStatus.processing + statistics.orderStatus.completed, name: '已成交', itemStyle: { color: '#52c41a' } },
          { value: statistics.orderStatus.pending, name: '待处理', itemStyle: { color: '#1890ff' } },
          { value: statistics.orderStatus.cancelled, name: '已取消', itemStyle: { color: '#ff4d4f' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  return (
    <div>
      <h2 className="page-title">数据统计</h2>
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="客户数量" value={statistics.customerCount} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="项目数量" value={statistics.projectCount} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="订单数量" value={statistics.orderCount} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="总销售额" value={statistics.totalSales} prefix="¥" />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="销售趋势">
                <ReactECharts option={salesTrendOption} style={{ height: 300 }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="订单状态分布">
                <ReactECharts option={orderStatusOption} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="订单类型分布">
                <ReactECharts option={customerLevelOption} style={{ height: 280 }} />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  )
}

export default StatisticsPage