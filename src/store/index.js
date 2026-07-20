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
      if (res.data.success) {
        const user = res.data.data
        commit('SET_CURRENT_USER', user)
        return { success: true, user }
      }
      return { success: false, message: res.data.message }
    },
    logout({ commit }) {
      commit('LOGOUT')
    },
    async updatePassword({ commit }, { oldPassword, newPassword }) {
      const res = await userAPI.updatePassword({ oldPassword, newPassword })
      if (res.data.success) {
        return { success: true, message: res.data.message }
      }
      return { success: false, message: res.data.message }
    }
  }
})
