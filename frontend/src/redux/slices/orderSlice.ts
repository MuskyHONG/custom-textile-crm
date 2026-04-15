import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axiosConfig'

interface Order {
  _id: string
  projectId: string
  customerId: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
  customer?: any
  project?: any
}

interface OrderState {
  orders: Order[]
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null
}

export const getOrders = createAsyncThunk('order/getOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders')
    return response.data.orders
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取订单列表失败')
  }
})

export const getOrderById = createAsyncThunk('order/getOrderById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/${id}`)
    return response.data.order
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取订单详情失败')
  }
})

export const createOrder = createAsyncThunk('order/createOrder', async (orderData: { projectId: string; customerId: string; totalAmount?: number }, { rejectWithValue }) => {
  try {
    const response = await api.post('/orders', orderData)
    return response.data.order
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '创建订单失败')
  }
})

export const updateOrderStatus = createAsyncThunk('order/updateOrderStatus', async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status })
    return response.data.order
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '更新订单状态失败')
  }
})

export const cancelOrder = createAsyncThunk('order/cancelOrder', async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
  try {
    await api.delete(`/orders/${id}`, {
      data: { reason }
    })
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '取消订单失败')
  }
})

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取订单列表
      .addCase(getOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 创建订单
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.orders.push(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 更新订单状态
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false
        const index = state.orders.findIndex(order => order._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 取消订单
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.orders.findIndex(order => order._id === action.payload)
        if (index !== -1) {
          state.orders[index].status = 'cancelled'
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = orderSlice.actions
export default orderSlice.reducer