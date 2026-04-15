import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axiosConfig'

interface Project {
  _id: string
  customerId: string
  name: string
  parameters: any
  basePrice?: number
  processCost?: number
  discount?: number
  tax?: number
  finalPrice?: number
  status: string
  createdAt: string
  updatedAt: string
  customer?: any
}

interface Template {
  _id: string
  name: string
  parameters: any
  createdAt: string
  updatedAt: string
}

interface ProjectState {
  projects: Project[]
  templates: Template[]
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  templates: [],
  loading: false,
  error: null
}

export const getProjects = createAsyncThunk('project/getProjects', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/projects')
    return response.data.projects
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取项目列表失败')
  }
})

export const getProjectById = createAsyncThunk('project/getProjectById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/projects/${id}`)
    return response.data.project
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取项目详情失败')
  }
})

export const createProject = createAsyncThunk('project/createProject', async (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/projects', projectData)
    return response.data.project
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '创建项目失败')
  }
})

export const updateProject = createAsyncThunk('project/updateProject', async ({ id, projectData }: { id: string; projectData: Partial<Project> }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data.project
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '更新项目失败')
  }
})

export const deleteProject = createAsyncThunk('project/deleteProject', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '删除项目失败')
  }
})

export const getTemplates = createAsyncThunk('project/getTemplates', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/projects/templates')
    return response.data.templates
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '获取模板列表失败')
  }
})

export const createTemplate = createAsyncThunk('project/createTemplate', async (templateData: Omit<Template, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/projects/templates', templateData)
    return response.data.template
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '创建模板失败')
  }
})

export const deleteTemplate = createAsyncThunk('project/deleteTemplate', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/templates/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || '删除模板失败')
  }
})

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取项目列表
      .addCase(getProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 创建项目
      .addCase(createProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects.push(action.payload)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 更新项目
      .addCase(updateProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false
        const index = state.projects.findIndex(project => project._id === action.payload._id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 删除项目
      .addCase(deleteProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects = state.projects.filter(project => project._id !== action.payload)
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 获取模板列表
      .addCase(getTemplates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.templates = action.payload
      })
      .addCase(getTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 创建模板
      .addCase(createTemplate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false
        state.templates.push(action.payload)
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 删除模板
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false
        state.templates = state.templates.filter(template => template._id !== action.payload)
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = projectSlice.actions
export default projectSlice.reducer