<template>
  <div>
    <el-card class="card" style="border-radius: 20px" shadow="hover">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>总结列表</span>
        <div style="display: flex; gap: 12px; align-items: center;">
          <el-select v-model="filterProjectId" placeholder="按项目筛选" clearable style="width: 200px">
            <el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
          <el-button type="primary" @click="openAdd">新建总结</el-button>
        </div>
      </div>
      <hr />
      <el-table :data="filteredList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="所属项目" width="120"><template #default="{ row }">{{ getProjectName(row.projectId) }}</template></el-table-column>
        <el-table-column label="总结类型" width="100"><template #default="{ row }"><el-tag :type="row.summaryType === '最终总结' ? 'success' : 'warning'" size="small">{{ row.summaryType || '阶段总结' }}</el-tag></template></el-table-column>
        <el-table-column prop="content" label="总结内容" min-width="300" show-overflow-tooltip />
        <el-table-column label="创建人" width="100"><template #default="{ row }">{{ getUserName(row.createdBy) }}</template></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新建总结" width="600px" align-center @closed="resetForm">
      <el-form :model="form" label-width="100px">
        <el-form-item label="所属项目"><el-select v-model="form.projectId" style="width: 100%" @change="form.taskId = null"><el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" /></el-select></el-form-item>
        <el-form-item label="关联任务"><el-select v-model="form.taskId" clearable style="width: 100%"><el-option v-for="t in filteredTasks" :key="t.id" :label="t.title" :value="t.id" /></el-select></el-form-item>
        <el-form-item label="总结类型"><el-radio-group v-model="form.summaryType"><el-radio label="阶段总结">阶段总结</el-radio><el-radio label="最终总结">最终总结</el-radio></el-radio-group></el-form-item>
        <el-form-item label="总结内容"><el-input v-model="form.content" type="textarea" :rows="6" placeholder="请在此撰写总结内容..." /></el-form-item>
      </el-form>
      <template #footer><el-button type="primary" @click="handleSubmit">提交</el-button><el-button @click="dialogVisible = false">取消</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { summaryAPI, projectAPI, taskAPI, userAPI } from '@/api'

const list = ref([]); const projectList = ref([]); const taskList = ref([]); const userList = ref([])
const loading = ref(false); const dialogVisible = ref(false); const filterProjectId = ref(null)
const form = ref({ projectId: null, taskId: null, summaryType: '阶段总结', content: '' })

const getProjectName = (id) => { const p = projectList.value.find(p => p.id === id); return p ? p.name : `#${id}` }
const getUserName = (id) => { const u = userList.value.find(u => u.id === id); return u ? (u.realName || u.username) : `#${id}` }

const filteredList = computed(() => filterProjectId.value ? list.value.filter(i => i.projectId === filterProjectId.value) : list.value)
const filteredTasks = computed(() => form.value.projectId ? taskList.value.filter(t => t.projectId === form.value.projectId) : taskList.value)

const fetchList = async () => { loading.value = true; try { const res = await summaryAPI.list(); list.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) { ElMessage.error('获取失败') } finally { loading.value = false } }
const fetchProjects = async () => { try { const res = await projectAPI.list(); projectList.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) {} }
const fetchTasks = async () => { try { const res = await taskAPI.list(); taskList.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) {} }
const fetchUsers = async () => { try { const res = await userAPI.list(); userList.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) {} }

const openAdd = () => { form.value = { projectId: filterProjectId.value || (projectList.value[0]?.id ?? null), taskId: null, summaryType: '阶段总结', content: '' }; dialogVisible.value = true }
const resetForm = () => { form.value = { projectId: null, taskId: null, summaryType: '阶段总结', content: '' } }
const handleSubmit = async () => {
  if (!form.value.projectId) { ElMessage.warning('请选择项目'); return }
  if (!form.value.content.trim()) { ElMessage.warning('请填写内容'); return }
  try { const r = await summaryAPI.add(form.value); ElMessage.success(r.data?.msg || '创建成功'); dialogVisible.value = false; fetchList() } catch (e) { ElMessage.error('操作失败') }
}

onMounted(() => { fetchProjects(); fetchTasks(); fetchUsers(); fetchList() })
</script>

<style scoped>.card { width: 100%; }</style>
