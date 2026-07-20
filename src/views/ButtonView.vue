<template>
  <el-radio-group v-model="tabPosition" style="margin-bottom: 30px">
    <el-radio-button value="top">top</el-radio-button>
    <el-radio-button value="right">right</el-radio-button>
    <el-radio-button value="bottom">bottom</el-radio-button>
    <el-radio-button value="left">left</el-radio-button>
  </el-radio-group>

  <el-tabs :tab-position="tabPosition" style="height: 200px" class="demo-tabs">
    <template #title>
            <span class="group-title">工作台</span>
          </template>
    <el-tab-pane label="User">User</el-tab-pane>
    <el-tab-pane label="Config">Config</el-tab-pane>
    <el-tab-pane label="Role">Role</el-tab-pane>
    <el-tab-pane label="Task">Task</el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref } from 'vue'

const tabPosition = ref('left')
</script>

<style>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.title {
  font-size: 24px;
  font-weight: bold;
  line-height: 2;       /* 压低大文字自身的行高 */
}

.group-title {
  display: block;
  text-align: left;        /* 确保文字靠左对齐 */
  padding-left: 8px;       /* 左边距，让它和下面的图标对齐 */
  margin-top: 16px;        /* 把“工作台”和上面的“小组任务协同”的距离拉开 */
  color: #909399;          /* 灰色 */
  font-size: 14px;         /* 字号大小 */
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}
</style>