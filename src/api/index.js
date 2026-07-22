// src/api/index.js
import axios from 'axios'

const BASE_URL = 'http://localhost:9000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
})

api.interceptors.request.use(
  config => {
    const userStr = sessionStorage.getItem('currentUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.id) {
          if (config.method === 'get') {
            config.params = { ...config.params, currentUserId: user.id }
          } else {
            if (config.data && typeof config.data === 'object') {
              config.data.currentUserId = user.id
            }
          }
        }
      } catch (e) {
        console.warn('解析 currentUser 失败', e)
      }
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API 请求失败:', error.message)
    return Promise.reject(error)
  }
)

export default api

export const projectAPI = {
  list: () => api.get('/project/list'),
  getOne: (id) => api.get(`/project/one/${id}`),
  add: (data) => api.post('/project/add', data),
  update: (data) => api.put('/project/update', data),
  delete: (id) => api.delete(`/project/delete/${id}`)
}

export const taskAPI = {
  list: (projectId) => api.get('/task/list', { params: projectId ? { projectId } : {} }),
  getOne: (id) => api.get(`/task/one/${id}`),
  add: (data) => api.post('/task/add', data),
  update: (data) => api.put('/task/update', data),
  delete: (id) => api.delete(`/task/delete/${id}`)
}

export const taskLogAPI = {
  list: (taskId) => api.get('/task-log/list', { params: taskId ? { taskId } : {} }),
  add: (data) => api.post('/task-log/add', data)
}

export const summaryAPI = {
  list: () => api.get('/summary/list'),
  add: (data) => api.post('/summary/add', data),
  update: (data) => api.put('/summary/update', data),
  delete: (id) => api.delete(`/summary/delete/${id}`)
}

export const userAPI = {
  list: () => api.get('/user/list'),
  updatePassword: (data) => api.post('/user/update-password', data)
}

export const authAPI = {
  login: (data) => api.post('/auth/login', data)
}

export const overviewAPI = {
  get: () => api.get('/overview')
}

export const aiAPI = {
  taskSuggestion: (data) => api.post('/ai/task-suggestion', data),
  taskPlan: (data) => api.post('/ai/task-plan', data),
  taskPlanImport: (data) => api.post('/ai/task-plan/import', data)
}