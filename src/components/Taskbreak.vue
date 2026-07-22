<template>
	<div v-if="isLeader">
		<el-card v-if="step === 1" class="card" style="border-radius: 20px" shadow="hover">
			<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><span>AI任务拆解</span></div>
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

		<el-card v-if="step === 2" class="card" style="border-radius: 20px" shadow="hover">
			<div style="text-align: center; padding: 80px 0;">
				<p style="margin-top: 20px; color: #606266; font-size: 16px;">AI 正在分析项目并拆解任务…</p>
				<p style="color: #909399; font-size: 13px;">预计需要 5~15 秒，请耐心等待</p>
			</div>
		</el-card>

		<el-card v-if="step === 3" class="card" style="border-radius: 20px" shadow="hover">
			<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
				<span>AI拆解结果</span>
				<div style="display: flex; gap: 12px;">
					<el-button type="primary" :loading="importing" @click="handleImport">导入选中任务</el-button>
				</div>
			</div>
			<hr />
			<div v-if="aiSummary" style="margin-bottom: 20px; padding: 12px; background: #f0f9eb; border-radius: 8px; color: #67c23a;">{{ aiSummary }}</div>
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

		<el-card v-if="step === 4" class="card" style="border-radius: 20px" shadow="hover">
			<div style="text-align: center; padding: 60px 0;">
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
			<p style="color: #909399; margin-top: 16px; font-size: 16px;">此功能仅对项目负责人开放</p>
		</div>
	</el-card>
</template>

<script>
import axios from "axios";
import { generateTaskPlan, buildFallbackPlan } from '@/api/dashscope'

export default {
	data() {
		return {
			step: 1, generating: false, importing: false,
			selectedItems: [],
			form: { projectId: null, goal: '', description: '' },
			projectList: [], userList: [],
			aiSummary: '', aiItems: [], importedCount: 0
		}
	},
	computed: {
		isLeader() { return this.$store.getters.isLeader },
		currentUserId() { return this.$store.getters.currentUserId },
		selectedCount() { return this.selectedItems.length }
	},
	mounted() {
		this.fetchProjects()
		this.fetchUsers()
	},
	methods: {
		onSelectionChange(sel) { this.selectedItems = sel },
		fetchProjects() {
			axios.get("http://localhost:9000/project/list")
				.then(res => { this.projectList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => console.log('获取项目列表失败', err))
		},
		fetchUsers() {
			axios.get("http://localhost:9000/user/list")
				.then(res => { this.userList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => console.log('获取用户列表失败', err))
		},
		handleGenerate() {
			if (!this.form.projectId) { alert('请选择所属项目'); return }
			if (!this.form.goal.trim()) { alert('请输入任务目标'); return }
			this.step = 2
			this.generating = true
			const selectedProject = this.projectList.find(p => p.id === this.form.projectId)
			const projectName = selectedProject?.name || ''
			const members = this.userList.length > 0 ? this.userList : [{ id: this.currentUserId, realName: '当前用户', role: '负责人' }]
			// 1) 尝试后端
			axios.post("http://localhost:9000/ai/task-plan", {
				projectId: this.form.projectId, operatorId: this.currentUserId,
				projectName, goal: this.form.goal, description: this.form.description || '', members
			}).then(res => {
				const data = res.data?.data || res.data
				if (data?.items?.length > 0) {
					this.showPlan(data, members)
				} else {
					this.tryDirectCall(projectName, members)
				}
			}).catch(err => {
				console.log('后端AI接口不可用，尝试直连千问...')
				this.tryDirectCall(projectName, members)
			})
		},
		tryDirectCall(projectName, members) {
			generateTaskPlan({ projectName, goal: this.form.goal, description: this.form.description || '', members })
				.then(planResult => {
					if (planResult) { alert('千问AI拆解完成') }
					this.showPlan(planResult || buildFallbackPlan(this.form.goal, members), members)
				})
				.catch(err => {
					console.log('千问直连失败:', err)
					this.showPlan(buildFallbackPlan(this.form.goal, members), members)
				})
		},
		showPlan(planResult, members) {
			this.aiSummary = planResult.summary || ''
			this.aiItems = (planResult.items || []).map(item => ({
				title: item.title || '', description: item.description || '',
				priority: item.priority || '中', suggestedDays: item.suggestedDays || 3,
				assigneeId: item.assigneeId || members[0]?.id || this.currentUserId
			}))
			this.step = 3
			this.generating = false
		},
		handleImport() {
			if (this.selectedItems.length === 0) { alert('请至少勾选一个任务'); return }
			const missing = this.selectedItems.find(item => !item.assigneeId)
			if (missing) { alert('"' + missing.title + '"未分配负责人'); return }
			this.importing = true
			axios.post("http://localhost:9000/ai/task-plan/import", {
				projectId: this.form.projectId, creatorId: this.currentUserId, items: this.selectedItems
			}).then(res => {
				this.importedCount = this.selectedItems.length
				this.step = 4
				alert('成功导入 ' + this.importedCount + ' 个任务')
			}).catch(err => {
				alert('导入失败')
				console.log(err)
			}).finally(() => this.importing = false)
		},
		backToInput() { this.step = 1; this.aiSummary = ''; this.aiItems = []; this.selectedItems = [] },
		resetAll() { this.form = { projectId: null, goal: '', description: '' }; this.backToInput() },
		goToTaskManagement() { this.$router.push('/taskmanagement') }
	}
}
</script>

<style scoped>.card { width: 100%; }</style>
