import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axiosConfig'

interface Customer {
  _id: string
  name: string
  customerId: string
  phone: string
  remark: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

interface CustomerState {
  customers: Customer[]
  loading: boolean
  error: string | null
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null
}

export const getCustomers = createAsyncThunk('customer/getCustomers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/customers')
    return response.data.customers
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取客户列表失败')
  }
})

export const getCustomerById = createAsyncThunk('customer/getCustomerById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/customers/${id}`)
    return response.data.customer
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取客户详情失败')
  }
})

export const createCustomer = createAsyncThunk('customer/createCustomer', async (customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/customers', customerData)
    return response.data.customer
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '创建客户失败')
  }
})

export const updateCustomer = createAsyncThunk('customer/updateCustomer', async ({ id, customerData }: { id: string; customerData: Partial<Customer> }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData)
    return response.data.customer
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '更新客户失败')
  }
})

export const deleteCustomer = createAsyncThunk('customer/deleteCustomer', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/customers/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '删除客户失败')
  }
})

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取客户列表
      .addCase(getCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 创建客户
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers.push(action.payload)
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 更新客户
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false
        const index = state.customers.findIndex(customer => customer._id === action.payload._id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 删除客户
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers = state.customers.filter(customer => customer._id !== action.payload)
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = customerSlice.actions
export default customerSlice.reducer