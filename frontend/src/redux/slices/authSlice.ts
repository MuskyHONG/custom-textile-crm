import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axiosConfig'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: any
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: localStorage.getItem('token') ? true : false,
  token: localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null
}

export const login = createAsyncThunk('auth/login', async (credentials: { username: string; password: string }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials)
    localStorage.setItem('token', response.data.token)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '登录失败')
  }
})

export const register = createAsyncThunk('auth/register', async (userData: { username: string; password: string; email: string }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData)
    localStorage.setItem('token', response.data.token)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '注册失败')
  }
})

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return rejectWithValue('未登录')
    }
    const response = await api.get('/auth/me')
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取用户信息失败')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token')
      state.isAuthenticated = false
      state.token = null
      state.user = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 注册
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 获取用户信息
      .addCase(getMe.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.token = null
        state.user = null
        localStorage.removeItem('token')
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer