<template>
  <div v-if="isLeader">
    <!-- 步骤1：输入表单 -->
    <el-card v-if="step === 1" class="card" style="border-radius: 20px" shadow="hover">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>AI任务拆解</span>
      </div>
      <hr />
      <el-form :model="form" label-width="100px" style="max-width: 700px">
        <el-form-item label="所属项目" required>
          <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务目标" required>
          <el-input v-model="form.goal" placeholder="例如：完成迎新活动准备工作" />
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input v-model="form.description" :rows="4" type="textarea" placeholder="可以补充时间要求、执行范围、注意事项等" />
        </el-form-item>
      </el-form>
      <el-button type="primary" :loading="generating" @click="handleGenerate">
        {{ generating ? 'AI正在拆解中...' : '生成拆解结果' }}
      </el-button>
    </el-card>

    <!-- 步骤2：AI生成中 -->
    <el-card v-if="step === 2" class="card" style="border-radius: 20px" shadow="hover">
      <div style="text-align: center; padding: 80px 0;">
        <el-icon class="is-loading" style="font-size: 48px; color: #409eff;"><Loading /></el-icon>
        <p style="margin-top: 20px; color: #606266; font-size: 16px;">AI 正在分析项目并拆解任务…</p>
        <p style="color: #909399; font-size: 13px;">预计需要 5~15 秒，请耐心等待</p>
      </div>
    </el-card>

    <!-- 步骤3：结果展示 -->
    <el-card v-if="step === 3" class="card" style="border-radius: 20px" shadow="hover">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>AI拆解结果</span>
        <div style="display: flex; gap: 12px;">
          <el-button type="primary" :loading="importing" @click="handleImport">导入选中任务</el-button>
        </div>
      </div>
      <hr />
      <el-alert v-if="aiSummary" :title="aiSummary" type="info" :closable="false" show-icon style="margin-bottom: 20px;" />
      <el-table :data="aiItems" border style="width: 100%" @selection-change="onSelectionChange" ref="tableRef">
        <el-table-column type="selection" width="50" />
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column label="任务标题" width="200">
          <template #default="{ row }"><el-input v-model="row.title" size="small" /></template>
        </el-table-column>
        <el-table-column label="任务说明" min-width="220">
          <template #default="{ row }"><el-input v-model="row.description" size="small" /></template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-select v-model="row.priority" size="small" style="width: 90px">
              <el-option label="高" value="高" /><el-option label="中" value="中" /><el-option label="低" value="低" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="建议天数" width="90">
          <template #default="{ row }"><el-input-number v-model="row.suggestedDays" :min="1" :max="30" size="small" style="width: 75px" /></template>
        </el-table-column>
        <el-table-column label="负责人" width="140">
          <template #default="{ row }">
            <el-select v-model="row.assigneeId" size="small" style="width: 120px">
              <el-option v-for="u in userList" :key="u.id" :label="u.realName || u.username" :value="u.id" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #909399; font-size: 13px;">已选择 {{ selectedCount }} / {{ aiItems.length }} 个任务</span>
        <el-button @click="backToInput">← 返回重新生成</el-button>
      </div>
    </el-card>

    <!-- 步骤4：导入成功 -->
    <el-card v-if="step === 4" class="card" style="border-radius: 20px" shadow="hover">
      <div style="text-align: center; padding: 60px 0;">
        <el-icon style="font-size: 48px; color: #67c23a;"><CircleCheckFilled /></el-icon>
        <p style="margin-top: 20px; color: #606266; font-size: 18px;">成功导入 <strong>{{ importedCount }}</strong> 个任务</p>
        <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
          <el-button type="primary" @click="goToTaskManagement">查看任务</el-button>
          <el-button @click="resetAll">继续拆解</el-button>
        </div>
      </div>
    </el-card>
  </div>

  <el-card v-else class="card" style="border-radius: 20px" shadow="hover">
    <div style="text-align: center; padding: 60px 0;">
      <el-icon style="font-size: 48px; color: #c0c4cc;"><Lock /></el-icon>
      <p style="color: #909399; margin-top: 16px; font-size: 16px;">此功能仅对项目负责人开放</p>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheckFilled, Lock } from '@element-plus/icons-vue'
import { aiAPI, projectAPI, userAPI } from '@/api'
import { generateTaskPlan, buildFallbackPlan } from '@/api/dashscope'

const router = useRouter()
const store = useStore()
const isLeader = computed(() => store.getters.isLeader)
const currentUserId = computed(() => store.getters.currentUserId)

const step = ref(1)
const generating = ref(false)
const importing = ref(false)
const selectedItems = ref([])
const tableRef = ref(null)

const form = ref({ projectId: null, goal: '', description: '' })
const projectList = ref([])
const userList = ref([])
const aiSummary = ref('')
const aiItems = ref([])
const importedCount = ref(0)

const selectedCount = computed(() => selectedItems.value.length)
const onSelectionChange = (sel) => { selectedItems.value = sel }

const fetchProjects = async () => {
  try {
    const res = await projectAPI.list()
    if (Array.isArray(res.data)) projectList.value = res.data
    else if (res.data?.data) projectList.value = res.data.data
  } catch (e) { console.warn('获取项目列表失败') }
}

const fetchUsers = async () => {
  try {
    const res = await userAPI.list()
    if (Array.isArray(res.data)) userList.value = res.data
    else if (res.data?.data) userList.value = res.data.data
  } catch (e) { console.warn('获取用户列表失败') }
}

const handleGenerate = async () => {
  if (!form.value.projectId) { ElMessage.warning('请选择所属项目'); return }
  if (!form.value.goal.trim()) { ElMessage.warning('请输入任务目标'); return }

  step.value = 2; generating.value = true

  const selectedProject = projectList.value.find(p => p.id === form.value.projectId)
  const projectName = selectedProject?.name || ''
  const members = userList.value.length > 0 ? userList.value : [{ id: currentUserId.value, realName: '当前用户', role: '负责人' }]
  let planResult = null

  // 1) 尝试后端（API Key 在后端安全存储，不暴露给浏览器）
  try {
    const res = await aiAPI.taskPlan({ projectId: form.value.projectId, operatorId: currentUserId.value, projectName, goal: form.value.goal, description: form.value.description || '', members })
    const data = res.data?.data || res.data
    if (data?.items?.length > 0) planResult = data
  } catch (e) { console.warn('后端AI接口不可用，尝试直连千问...') }

  // 2) 直连千问
  if (!planResult) {
    try {
      planResult = await generateTaskPlan({ projectName, goal: form.value.goal, description: form.value.description || '', members })
      if (planResult) ElMessage.success('千问AI拆解完成')
    } catch (e) { console.warn('千问直连失败:', e.message) }
  }

  // 3) 扑底方案
  if (!planResult?.items?.length) {
    ElMessage.info('使用标准拆解方案')
    planResult = buildFallbackPlan(form.value.goal, members)
  }

  aiSummary.value = planResult.summary || ''
  aiItems.value = (planResult.items || []).map(item => ({
    title: item.title || '', description: item.description || '',
    priority: item.priority || '中', suggestedDays: item.suggestedDays || 3,
    assigneeId: item.assigneeId || members[0]?.id || currentUserId.value
  }))
  step.value = 3; generating.value = false
}

const handleImport = async () => {
  if (selectedItems.value.length === 0) { ElMessage.warning('请至少勾选一个任务'); return }
  const missing = selectedItems.value.find(item => !item.assigneeId)
  if (missing) { ElMessage.warning(`"${missing.title}"未分配负责人`); return }

  importing.value = true
  try {
    await aiAPI.taskPlanImport({ projectId: form.value.projectId, creatorId: currentUserId.value, items: selectedItems.value })
    importedCount.value = selectedItems.value.length; step.value = 4
    ElMessage.success(`成功导入 ${importedCount.value} 个任务`)
  } catch (e) { ElMessage.error('导入失败') }
  finally { importing.value = false }
}

const backToInput = () => { step.value = 1; aiSummary.value = ''; aiItems.value = []; selectedItems.value = [] }
const resetAll = () => { form.value = { projectId: null, goal: '', description: '' }; backToInput() }
const goToTaskManagement = () => router.push('/taskmanagement')

onMounted(() => { fetchProjects(); fetchUsers() })
</script>

<style scoped>.card { width: 100%; }</style>
