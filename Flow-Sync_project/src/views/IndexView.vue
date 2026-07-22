<template>
  <div class="common-layout">
    <el-container class="your-outmost-container">
      <el-header class="custom-header" height="80px" style="border-bottom:solid lightgray 1px;">
        <div class="logo-container" style="border-right:solid lightgray 1px">
          <div class="title">FlowSync</div>
          <div class="subtitle">小组任务协同</div>
        </div>
        <div class="header-right-main">
          <div class="title">总览</div>
          <div class="subtitle">查看系统整体情况与最近动态</div>
        </div>
        <div>
          <el-button plain>刷新数据</el-button>
          <el-button type="danger" plain>退出登录</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <div>
    <el-row class="tac">
    <el-col :span="24">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        router
      >
        <el-menu-item-group>
          <template #title>
            <span class="group-title">工作台</span>
          </template>
          <el-menu-item index="/overview">
              <el-icon><HomeFilled /></el-icon>
              <span line-height="1">总览</span>
          </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
        <template #title>
            <span class="group-title1">业务管理</span>
          </template>
        <el-menu-item index="/pm">
          <el-icon><Collection /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        <el-menu-item index="/taskbreak">
          <el-icon><MagicStick /></el-icon>
          <span>任务拆解</span>
        </el-menu-item>
        <el-menu-item index="8"disabled>
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="4"disabled>
          <el-icon><Timer /></el-icon>
          <span>进度跟踪</span>
        </el-menu-item>
        <el-menu-item index="5"disabled>
          <el-icon><Document /></el-icon>
          <span>总结中心</span>
        </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group>
          <template #title>
            <span class="group-title">系统信息</span>
          </template>
          <el-menu-item index="6"disabled>
              <el-icon><User /></el-icon>
              <span line-height="1">成员列表</span>
          </el-menu-item>
          <el-menu-item index="7"disabled>
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

import Overview from '@/components/Overview.vue';
</script>

<style>
  .logo-container {
  display: flex;
  flex-direction: column; /* 让文字上下排列 */
  gap: 4px;              /* 精准控制两个文本之间的间距，数字越小越紧凑 */
  align-items: flex-start; /* 左对齐 */
  width:179px;
  height:100%;
}

.custom-header {
  display: flex;         /* 开启 flex 布局，让左右两块横向排列 */
  align-items: center;   /* 垂直居中 */
  height: 64px;
  padding: 0;            /* 注意：把默认 padding 设为 0，方便两条线完美对接 */
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6; /* 底部通栏横线 */
  border-right: 1px solid #e6e6e6;
}

.header-right-main {
  /* flex: 1;               核心：等同于 main 的效果，自动吃掉右边所有剩下的宽度
  height: 100%;
  padding: 0 24px;       右侧内部的边距
  display: flex;
  align-items: center;   让右边的内容（比如文字或菜单）垂直居中
  gap: 4px;  */
    display: flex;
  flex-direction: column; /* 让文字上下排列 */
  gap: 4px;              /* 精准控制两个文本之间的间距，数字越小越紧凑 */
  align-items: flex-start; /* 左对齐 */
  flex: 1;
  margin-left: 30px;
  height:100%;
}

.title {
  font-size: 24px;
  font-weight: bold;
  line-height: 2;       /* 压低大文字自身的行高 */
}

.subtitle {
  font-size: 14px;
  color: #666;
  line-height: 1;
}
.group-title {
  display: block;
  text-align: left;        /* 确保文字靠左对齐 */
  padding-left: 8px;       /* 左边距，让它和下面的图标对齐 */
  margin-top: 16px;        /* 把“工作台”和上面的“小组任务协同”的距离拉开 */
  color: #909399;          /* 灰色 */
  font-size: 14px;         /* 字号大小 */
}
.group-title1 {
  display: block;
  text-align: left;        /* 确保文字靠左对齐 */
  padding-left: 8px;       /* 左边距，让它和下面的图标对齐 */
  margin-top: 1px;        /* 把“工作台”和上面的“小组任务协同”的距离拉开 */
  color: #909399;          /* 灰色 */
  font-size: 14px;         /* 字号大小 */
}

.your-outmost-container {
  width: 98vw;       /* 100% 视口宽度 */
  height: 98vh;      /* 100% 视口高度 */
  overflow: hidden;   /* 极其重要：防止整个大页面产生丑陋的全局双滚动条 */
}
</style>