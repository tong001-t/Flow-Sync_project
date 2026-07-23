<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-left">
        <div class="brand-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
              <rect width="48" height="48" rx="12" fill="url(#grad)" />
              <path d="M14 24l6 6 14-14" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stop-color="#409eff"/>
                  <stop offset="100%" stop-color="#337ecc"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="brand-text">
            <h1>FlowSync</h1>
            <p>小组任务协同系统</p>
          </div>
        </div>
        <div class="brand-features">
          <div class="feature-item"><span class="feature-dot"></span><span>AI 智能任务拆解</span></div>
          <div class="feature-item"><span class="feature-dot"></span><span>团队进度实时跟踪</span></div>
          <div class="feature-item"><span class="feature-dot"></span><span>项目总结一键生成</span></div>
        </div>
      </div>

      <div class="login-right">
        <div class="form-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号信息</p>
        </div>
        <el-form ref="formRef" :model="loginForm" :rules="rules" label-width="0" class="login-form" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>
        <div class="preset-accounts">
          <p class="preset-title">预设账号（点击快速填充）</p>
          <div class="preset-list">
            <div class="preset-item" @click="fillAccount('leader', '123456')">
              <el-tag type="danger" size="small">负责人</el-tag><span>leader / 123456</span>
            </div>
            <div class="preset-item" @click="fillAccount('member1', '123456')">
              <el-tag type="info" size="small">成员</el-tag><span>member1 / 123456</span>
            </div>
            <div class="preset-item" @click="fillAccount('member2', '123456')">
              <el-tag type="info" size="small">成员</el-tag><span>member2 / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="login-footer"><span>© 2025 FlowSync · 小组任务协同系统</span></div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()
const formRef = ref(null)
const loading = ref(false)
const loginForm = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 4, message: '密码长度不少于4位', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const result = await store.dispatch('login', { username: loginForm.username, password: loginForm.password })
    if (result.success) {
      ElMessage.success(`欢迎回来，${result.user.realName || result.user.username}！`)
      router.push('/overview')
    } else {
      ElMessage.error(result.message || '用户名或密码错误')
    }
  } catch (e) {
    const mockUsers = {
      leader: { id: 1, username: 'leader', realName: '项目负责人', role: '负责人', phone: '', email: '' },
      member1: { id: 2, username: 'member1', realName: '成员一', role: '成员', phone: '', email: '' },
      member2: { id: 3, username: 'member2', realName: '成员二', role: '成员', phone: '', email: '' }
    }
    const user = mockUsers[loginForm.username]
    if (user && loginForm.password === '123456') {
      store.commit('SET_CURRENT_USER', user)
      ElMessage.success(`欢迎回来，${user.realName}！（离线模式）`)
      router.push('/overview')
    } else {
      ElMessage.error('用户名或密码错误（后端未连接，仅支持预设账号）')
    }
  } finally {
    loading.value = false
  }
}

const fillAccount = (username, password) => {
  loginForm.username = username
  loginForm.password = password
}
</script>

<style scoped>
.login-wrapper { width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #e8f4fd 0%, #f0f2f5 50%, #e8f0fe 100%); overflow: hidden; }
.login-card { display: flex; width: 860px; min-height: 500px; background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04); overflow: hidden; }
.login-left { width: 380px; background: linear-gradient(160deg, #1a6fb5 0%, #409eff 40%, #337ecc 100%); color: #fff; display: flex; flex-direction: column; justify-content: center; padding: 48px 40px; position: relative; overflow: hidden; }
.login-left::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.06); }
.login-left::after { content: ''; position: absolute; bottom: -40px; left: -40px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.04); }
.brand-logo { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; position: relative; z-index: 1; }
.brand-text h1 { font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px; }
.brand-text p { font-size: 13px; color: rgba(255,255,255,0.8); margin: 4px 0 0; letter-spacing: 2px; }
.brand-features { display: flex; flex-direction: column; gap: 18px; position: relative; z-index: 1; }
.feature-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.9); }
.feature-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.7); flex-shrink: 0; }
.login-right { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 48px 48px 48px 44px; }
.form-header { margin-bottom: 36px; }
.form-header h2 { font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0; }
.form-header p { font-size: 13px; color: #999; margin: 8px 0 0; }
.login-form { margin-bottom: 20px; }
.login-form :deep(.el-input__wrapper) { border-radius: 10px; box-shadow: 0 0 0 1px #e4e7ed inset; transition: box-shadow 0.2s; }
.login-form :deep(.el-input__wrapper:hover) { box-shadow: 0 0 0 1px #c0c4cc inset; }
.login-form :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px #409eff inset; }
.login-btn { width: 100%; border-radius: 10px; font-size: 16px; letter-spacing: 4px; height: 46px; margin-top: 8px; }
.preset-accounts { border-top: 1px solid #f0f0f0; padding-top: 20px; }
.preset-title { font-size: 12px; color: #bbb; margin: 0 0 12px; text-align: center; }
.preset-list { display: flex; flex-direction: column; gap: 8px; }
.preset-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; font-size: 13px; color: #666; }
.preset-item:hover { background: #f5f7fa; }
.preset-item span { font-family: 'Consolas', 'Monaco', monospace; }
.login-footer { margin-top: 24px; font-size: 12px; color: #bbb; }
</style>
