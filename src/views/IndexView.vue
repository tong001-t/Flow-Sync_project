<template>
  <div class="common-layout">
    <el-container class="your-outmost-container">
      <el-header class="custom-header" height="80px" style="border-bottom:solid lightgray 1px;">
        <div class="logo-container" style="border-right:solid lightgray 1px">
          <div class="title">FlowSync</div>
          <div class="subtitle">小组任务协同</div>
        </div>
        <div class="header-right-main">
          <div class="title">{{ currentPageTitle }}</div>
          <div class="subtitle">{{ currentPageSubtitle }}</div>
        </div>
        <div class="user-welcome">
          <span class="welcome-text">Welcome！</span>
          <span class="user-name">{{ currentUser.realName || currentUser.username }}</span>
          <span class="user-role-tag" :class="isLeader ? 'role-leader' : 'role-member'">（{{ currentUser.role }}）</span>
        </div>
        <div class="header-actions">
          <el-button plain @click="refreshPage">刷新数据</el-button>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <div>
    <el-row class="tac">
    <el-col :span="24">
      <el-menu
        default-active="/overview"
        class="el-menu-vertical-demo"
        router
      >
        <el-menu-item-group>
          <template #title><span class="group-title">工作台</span></template>
          <el-menu-item index="/overview">
              <el-icon><HomeFilled /></el-icon>
              <span line-height="1">总览</span>
          </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
        <template #title><span class="group-title1">业务管理</span></template>
        <el-menu-item index="/pm">
          <el-icon><Collection /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        <el-menu-item v-if="isLeader" index="/taskbreak">
          <el-icon><MagicStick /></el-icon>
          <span>任务拆解</span>
        </el-menu-item>
        <el-menu-item index="/taskmanagement">
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="/progresstracking">
          <el-icon><Timer /></el-icon>
          <span>进度跟踪</span>
        </el-menu-item>
        <el-menu-item index="/summarycenter">
          <el-icon><Document /></el-icon>
          <span>总结中心</span>
        </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
          <template #title><span class="group-title">系统信息</span></template>
          <el-menu-item index="/memberlist">
              <el-icon><User /></el-icon>
              <span line-height="1">成员列表</span>
          </el-menu-item>
          <el-menu-item index="/personalinfo">
              <el-icon><UserFilled /></el-icon>
              <span line-height="1">个人信息</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
    </el-col>
  </el-row>
  </div>
        </el-aside>
        <el-main style="background-color:#F5F7FA"><router-view /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()

const isLeader = computed(() => store.getters.isLeader)
const currentUser = computed(() => store.getters.currentUser || {})

const pageTitles = {
  '/overview': { title: '总览', subtitle: '查看系统整体情况与最近动态' },
  '/pm': { title: '项目管理', subtitle: '创建、编辑和管理项目' },
  '/taskbreak': { title: 'AI任务拆解', subtitle: '使用AI智能拆解项目任务' },
  '/taskmanagement': { title: '任务管理', subtitle: '分配和跟踪团队任务' },
  '/progresstracking': { title: '进度跟踪', subtitle: '记录和查看任务进度更新' },
  '/summarycenter': { title: '总结中心', subtitle: '撰写阶段总结与最终总结' },
  '/memberlist': { title: '成员列表', subtitle: '查看系统团队成员信息' },
  '/personalinfo': { title: '个人信息', subtitle: '管理个人资料与安全密码' }
}

const currentPageTitle = computed(() => pageTitles[route.path]?.title || 'FlowSync')
const currentPageSubtitle = computed(() => pageTitles[route.path]?.subtitle || '小组任务协同系统')

const refreshPage = () => router.go(0)
const handleLogout = () => { store.dispatch('logout'); router.push('/login') }
</script>

<style>
.user-welcome {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 20px;
  white-space: nowrap;
  border-left: 1px solid #e6e6e6;
  height: 100%;
}

.welcome-text {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.user-role-tag {
  font-size: 13px;
  font-weight: 500;
}

.role-leader {
  color: #e6a23c;
}

.role-member {
  color: #909399;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 16px;
}

  .logo-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  width:179px;
  height:100%;
}

.custom-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  border-right: 1px solid #e6e6e6;
}

.header-right-main {
    display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  flex: 1;
  margin-left: 30px;
  height:100%;
}

.title {
  font-size: 24px;
  font-weight: bold;
  line-height: 2;
}

.subtitle {
  font-size: 14px;
  color: #666;
  line-height: 1;
}
.group-title {
  display: block;
  text-align: left;
  padding-left: 8px;
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}
.group-title1 {
  display: block;
  text-align: left;
  padding-left: 8px;
  margin-top: 1px;
  color: #909399;
  font-size: 14px;
}

.your-outmost-container {
  width: 98vw;
  height: 98vh;
  overflow: hidden;
}
</style>
