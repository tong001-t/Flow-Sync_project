<template>
  <div>
    <el-card class="card" style="border-radius: 20px" shadow="hover">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>任务列表</span>
        <div style="display: flex; gap: 12px; align-items: center;">
          <el-select v-model="filterProjectId" placeholder="按项目筛选" clearable style="width: 200px" @change="fetchList">
            <el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
          <el-button v-if="isLeader" type="primary" @click="openAdd">新建任务</el-button>
        </div>
      </div>
      <hr />
      <el-table :data="list" border style="width: 100%;height:500px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="任务标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="所属项目" width="120"><template #default="{ row }">{{ getProjectName(row.projectId) }}</template></el-table-column>
        <el-table-column label="负责人" width="100"><template #default="{ row }">{{ getUserName(row.assigneeId) }}</template></el-table-column>
        <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ row.status || '未开始' }}</el-tag></template></el-table-column>
        <el-table-column label="优先级" width="80"><template #default="{ row }"><el-tag :type="priorityType(row.priority)" size="small">{{ row.priority || '中' }}</el-tag></template></el-table-column>
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="isLeader || row.assigneeId === currentUserId" type="primary" size="small" @click="openEdit(row)">{{ isLeader ? '编辑' : '更新状态' }}</el-button>
            <el-button v-if="isLeader" type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" align-center @closed="resetForm">
      <el-form :model="form" label-width="100px">
        <!-- <el-form-item label="任务标题"><el-input v-model="form.id" :disabled="!isLeader" /></el-form-item> -->
        <el-form-item v-if="isLeader" label="所属项目"><el-select v-model="form.projectId" style="width: 100%"><el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" /></el-select></el-form-item>
        <el-form-item label="任务标题"><el-input v-model="form.title" :disabled="!isLeader" /></el-form-item>
        <el-form-item label="任务说明"><el-input v-model="form.description" type="textarea" :rows="3" :disabled="!isLeader" /></el-form-item>
        <el-form-item v-if="isLeader" label="负责人"><el-select v-model="form.assigneeId" style="width: 100%"><el-option v-for="u in userList" :key="u.id" :label="u.realName || u.username" :value="u.id" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status" style="width: 100%"><el-option label="未开始" value="未开始" /><el-option label="进行中" value="进行中" /><el-option label="已完成" value="已完成" /></el-select></el-form-item>
        <el-form-item v-if="isLeader" label="优先级"><el-select v-model="form.priority" style="width: 100%"><el-option label="低" value="低" /><el-option label="中" value="中" /><el-option label="高" value="高" /></el-select></el-form-item>
        <el-form-item v-if="isLeader" label="截止日期"><el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer><el-button type="primary" @click="handleSubmit">提交</el-button><el-button @click="dialogVisible = false">取消</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskAPI, projectAPI, userAPI } from '@/api'

const store = useStore()
const isLeader = computed(() => store.getters.isLeader)
const currentUserId = computed(() => store.getters.currentUserId)

const list = ref([]); const projectList = ref([]); const userList = ref([])
const loading = ref(false); const dialogVisible = ref(false); const filterProjectId = ref(null); const isEdit = ref(false)
const form = ref({ id: 0, projectId: null, title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' })

const dialogTitle = computed(() => !isEdit.value ? '新建任务' : (isLeader.value ? '编辑任务' : '更新任务状态'))
const getProjectName = (id) => { const p = projectList.value.find(p => p.id === id); return p ? p.name : `#${id}` }
const getUserName = (id) => { const u = userList.value.find(u => u.id === id); return u ? (u.realName || u.username) : `#${id}` }
const statusType = (s) => s === '已完成' ? 'success' : (s === '进行中' ? 'warning' : 'info')
const priorityType = (p) => p === '高' ? 'danger' : (p === '中' ? 'warning' : 'info')

const fetchList = async () => {
  loading.value = true
  try { const res = await taskAPI.list(filterProjectId.value); const d = res.data; list.value = Array.isArray(d) ? d : (d?.data || []) } catch (e) { ElMessage.error('获取任务列表失败') } finally { loading.value = false }
}
const fetchProjects = async () => { try { const res = await projectAPI.list(); projectList.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) {} }
const fetchUsers = async () => { try { const res = await userAPI.list(); userList.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) {} }

const openAdd = () => { isEdit.value = false; form.value = { id: null, projectId: filterProjectId.value || (projectList.value[0]?.id ?? null), title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' }; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; form.value = { ...row, dueDate: row.dueDate || '' }; dialogVisible.value = true }
const resetForm = () => { form.value = { id: null, projectId: null, title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' } }

const handleSubmit = async () => {
  if (!form.value.title) { ElMessage.warning('请输入任务标题'); return }
  try { const r = await (isEdit.value ? taskAPI.update(form.value) : taskAPI.add(form.value)); ElMessage.success(r.data?.msg || r.data?.message || (isEdit.value ? '更新成功' : '创建成功')); dialogVisible.value = false; fetchList() } catch (e) { ElMessage.error('操作失败') }
}
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除"${row.title}"？`, '确认删除', { type: 'warning' }).then(async () => { try { await taskAPI.delete(row.id); ElMessage.success('删除成功'); fetchList() } catch (e) { ElMessage.error('删除失败') } }).catch(() => {})
}

onMounted(() => { fetchProjects(); fetchUsers(); fetchList() })
</script>

<style scoped>.card { width: 100%; }</style>
