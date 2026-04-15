import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import customerReducer from './slices/customerSlice'
import projectReducer from './slices/projectSlice'
import orderReducer from './slices/orderSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    project: projectReducer,
    order: orderReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store