<template>
  <div>
    <el-card class="card" style="border-radius: 20px" shadow="hover">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>进度记录列表</span>
        <div style="display: flex; gap: 12px; align-items: center;">
          <el-select v-model="filterTaskId" placeholder="按任务筛选" clearable style="width: 220px" @change="fetchList">
            <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
          </el-select>
          <el-button type="primary" @click="openAdd">新增进度记录</el-button>
        </div>
      </div>
      <hr />
      <el-table :data="list" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="关联任务" width="180" show-overflow-tooltip><template #default="{ row }">{{ getTaskTitle(row.taskId) }}</template></el-table-column>
        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-progress :percentage="row.progressPercent || 0" :stroke-width="16" :color="progressColor(row.progressPercent)" style="flex: 1;" />
              <span style="font-weight: bold; min-width: 40px;">{{ row.progressPercent || 0 }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="说明内容" min-width="250" show-overflow-tooltip />
        <el-table-column label="操作人" width="100"><template #default="{ row }">{{ getUserName(row.operatorId) }}</template></el-table-column>
        <el-table-column prop="createTime" label="记录时间" width="170" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增进度记录" width="550px" align-center @closed="resetForm">
      <el-form :model="form" label-width="100px">
        <el-form-item label="关联任务"><el-select v-model="form.taskId" style="width: 100%"><el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" /></el-select></el-form-item>
        <el-form-item label="进度百分比"><el-slider v-model="form.progressPercent" :min="0" :max="100" :step="5" show-input style="width: 100%" /></el-form-item>
        <el-form-item label="说明内容"><el-input v-model="form.content" type="textarea" :rows="4" placeholder="请描述本次进度更新内容..." /></el-form-item>
      </el-form>
      <template #footer><el-button type="primary" @click="handleSubmit">提交</el-button><el-button @click="dialogVisible = false">取消</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { taskLogAPI, taskAPI, userAPI } from '@/api'

const list = ref([]); const taskList = ref([]); const userList = ref([])
const loading = ref(false); const dialogVisible = ref(false); const filterTaskId = ref(null)
const form = ref({ taskId: null, progressPercent: 0, content: '' })

const getTaskTitle = (id) => { const t = taskList.value.find(t => t.id === id); return t ? t.title : `#${id}` }
const getUserName = (id) => { const u = userList.value.find(u => u.id === id); return u ? (u.realName || u.username) : `#${id}` }
const progressColor = (pct) => pct >= 100 ? '#67c23a' : (pct >= 60 ? '#409eff' : (pct >= 30 ? '#e6a23c' : '#909399'))

const fetchList = async () => { loading.value = true; try { const res = await taskLogAPI.list(filterTaskId.value); list.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) { ElMessage.error('获取失败') } finally { loading.value = false } }
const fetchTasks = async () => { try { const res = await taskAPI.list(); taskList.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) {} }
const fetchUsers = async () => { try { const res = await userAPI.list(); userList.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) {} }

const openAdd = () => { form.value = { taskId: filterTaskId.value || (taskList.value[0]?.id ?? null), progressPercent: 0, content: '' }; dialogVisible.value = true }
const resetForm = () => { form.value = { taskId: null, progressPercent: 0, content: '' } }
const handleSubmit = async () => {
  if (!form.value.taskId) { ElMessage.warning('请选择任务'); return }
  if (!form.value.content.trim()) { ElMessage.warning('请填写说明'); return }
  try { const r = await taskLogAPI.add(form.value); ElMessage.success(r.data?.msg || '添加成功'); dialogVisible.value = false; fetchList() } catch (e) { ElMessage.error('操作失败') }
}

onMounted(() => { fetchTasks(); fetchUsers(); fetchList() })
</script>

<style scoped>.card { width: 100%; }</style>
