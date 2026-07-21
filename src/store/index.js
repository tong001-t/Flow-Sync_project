import { createStore } from 'vuex'
import { authAPI, userAPI } from '@/api'

export default createStore({
  state: {
    currentUser: (() => {
      try {
        const stored = sessionStorage.getItem('currentUser')
        return stored ? JSON.parse(stored) : null
      } catch { return null }
    })()
  },
  getters: {
    isLoggedIn: state => !!state.currentUser,
    currentUser: state => state.currentUser,
    isLeader: state => state.currentUser?.role === '负责人',
    currentUserId: state => state.currentUser?.id
  },
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
      sessionStorage.setItem('currentUser', JSON.stringify(user))
    },
    LOGOUT(state) {
      state.currentUser = null
      sessionStorage.removeItem('currentUser')
    }
  },
  actions: {
    async login({ commit }, { username, password }) {
      const res = await authAPI.login({ username, password })
      const data = res.data
      // 后端统一返回 { code: 100/101, message, data }
      if (data.code === 100 && data.data) {
        const user = data.data
        commit('SET_CURRENT_USER', user)
        return { success: true, user }
      }
      return { success: false, message: data.message }
    },
    logout({ commit }) {
      commit('LOGOUT')
    },
    async updatePassword({ commit }, { oldPassword, newPassword }) {
      const res = await userAPI.updatePassword({ oldPassword, newPassword })
      const data = res.data
      if (data.code === 100) {
        return { success: true, message: data.message }
      }
      return { success: false, message: data.message }
    }
  }
})
