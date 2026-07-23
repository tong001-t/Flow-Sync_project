<template>
	<div>
		<el-card class="card" style="border-radius: 20px" shadow="hover">
			<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
				<span>进度记录列表</span>
				<div style="display: flex; gap: 12px; align-items: center;">
					<el-select v-model="filterTaskId" placeholder="按任务筛选" clearable style="width: 220px" @change="fetchList">
						<el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
					</el-select>
					<el-button type="primary" :disabled="filterTaskCompleted" @click="openAdd">新增进度记录</el-button>
				</div>
			</div>
			<hr />
			<el-table :data="list" border style="width: 100%" v-loading="loading">
				<el-table-column prop="displayIndex" label="ID" width="60" />
				<el-table-column label="关联任务" width="180" show-overflow-tooltip><template #default="{ row }">{{ getTaskTitle(row.taskId) }}</template></el-table-column>
				<el-table-column label="进度" width="200">
					<template #default="{ row }">
						<div style="display: flex; align-items: center; gap: 8px;">
							<el-progress :percentage="row.progressPercent || 0" :stroke-width="16" :color="progressColor(row.progressPercent)" style="flex: 1;" />
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="content" label="说明内容" min-width="250" show-overflow-tooltip />
				<el-table-column label="操作人" width="100"><template #default="{ row }">{{ getUserName(row.operatorId) }}</template></el-table-column>
				<el-table-column prop="createTime" label="记录时间" width="170" />
			</el-table>
		</el-card>

		<el-dialog v-model="dialogVisible" title="新增进度记录" width="550px" align-center @closed="resetForm">
			<el-alert v-if="formTaskCompleted" title="该任务进度已达 100%，不允许新增记录" type="warning" show-icon :closable="false" style="margin-bottom: 16px;" />
			<el-form :model="form" label-width="100px">
				<el-form-item label="关联任务"><el-select v-model="form.taskId" style="width: 100%"><el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" /></el-select></el-form-item>
				<el-form-item label="进度百分比"><el-slider v-model="form.progressPercent" :min="formMinProgress" :max="100" :step="5" show-input style="width: 100%" /><div v-if="formMinProgress > 0" style="color: #909399; font-size: 12px; margin-top: 4px;">当前任务最低进度：{{ formMinProgress }}%</div></el-form-item>
				<el-form-item label="说明内容"><el-input v-model="form.content" type="textarea" :rows="4" placeholder="请描述本次进度更新内容..." /></el-form-item>
			</el-form>
			<template #footer><el-button type="primary" :disabled="formTaskCompleted" @click="handleSubmit">提交</el-button><el-button @click="dialogVisible = false">取消</el-button></template>
		</el-dialog>
	</div>
</template>

<script>
import axios from "axios";
export default {
	data() {
		return {
			list: [], taskList: [], userList: [],
			loading: false, dialogVisible: false, filterTaskId: null,
			form: { taskId: null, progressPercent: 0, content: '' }
		}
	},
	computed: {
		completedTaskIds() {
			const maxByTask = {}
			this.list.forEach(r => {
				const key = String(r.taskId)
				const pct = r.progressPercent || 0
				if (maxByTask[key] === undefined || pct > maxByTask[key]) {
					maxByTask[key] = pct
				}
			})
			const set = new Set()
			Object.keys(maxByTask).forEach(k => { if (maxByTask[k] >= 100) set.add(k) })
			return set
		},
		filterTaskCompleted() {
			return this.filterTaskId ? this.completedTaskIds.has(String(this.filterTaskId)) : false
		},
		formTaskCompleted() {
			return this.form.taskId ? this.completedTaskIds.has(String(this.form.taskId)) : false
		},
		formMinProgress() {
			if (!this.form.taskId) return 0
			const max = this.list
				.filter(r => String(r.taskId) === String(this.form.taskId))
				.reduce((m, r) => Math.max(m, r.progressPercent || 0), 0)
			return max
		}
	},
	watch: {
		'form.taskId'() {
			if (this.form.progressPercent < this.formMinProgress) {
				this.form.progressPercent = this.formMinProgress
			}
		}
	},
	mounted() {
		this.fetchTasks()
		this.fetchUsers()
		this.fetchList()
	},
	methods: {
		getTaskTitle(id) { const t = this.taskList.find(t => t.id === id); return t ? t.title : '#' + id },
		getUserName(id) { const u = this.userList.find(u => u.id === id); return u ? (u.realName || u.username) : '#' + id },
		progressColor(pct) { return pct >= 100 ? '#67c23a' : (pct >= 60 ? '#409eff' : (pct >= 30 ? '#e6a23c' : '#909399')) },
		fetchList() {
			this.loading = true
			const params = this.filterTaskId ? { taskId: this.filterTaskId } : {}
			axios.get("http://localhost:9000/task-log/list", { params })
				.then(res => {
					const raw = Array.isArray(res.data) ? res.data : (res.data?.data || [])
					const counters = {}
					this.list = raw.map(r => {
						counters[r.taskId] = (counters[r.taskId] || 0) + 1
						return { ...r, displayIndex: counters[r.taskId] }
					})
				})
				.catch(err => { alert('获取失败'); console.log(err) })
				.finally(() => this.loading = false)
		},
		fetchTasks() {
			axios.get("http://localhost:9000/task/list")
				.then(res => { this.taskList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => console.log(err))
		},
		fetchUsers() {
			axios.get("http://localhost:9000/user/list")
				.then(res => { this.userList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => console.log(err))
		},
		openAdd() {
			this.form = { taskId: this.filterTaskId || (this.taskList[0]?.id || null), progressPercent: 0, content: '' }
			this.dialogVisible = true
		},
		resetForm() { this.form = { taskId: null, progressPercent: 0, content: '' } },
		handleSubmit() {
			if (!this.form.taskId) { alert('请选择任务'); return }
			if (!this.form.content.trim()) { alert('请填写说明'); return }
			const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
			const data = { ...this.form, currentUserId: user.id }
			axios.get("http://localhost:9000/task-log/list", { params: { taskId: this.form.taskId } })
				.then(res => {
					const records = Array.isArray(res.data) ? res.data : (res.data?.data || [])
					const maxPct = records.reduce((m, r) => Math.max(m, r.progressPercent || 0), 0)
					if (maxPct >= 100) {
						alert('该任务进度已达 100%，不允许新增记录')
						return
					}
					if (this.form.progressPercent < maxPct) {
						alert('进度不能低于当前最大进度 ' + maxPct + '%')
						return
					}
					axios.post("http://localhost:9000/task-log/add", data)
						.then(res => { alert(res.data?.message || '添加成功'); this.dialogVisible = false; this.fetchList() })
						.catch(err => { alert('操作失败'); console.log(err) })
				})
				.catch(err => { alert('校验失败'); console.log(err) })
		}
	}
}
</script>

<style scoped>.card { width: 100%; }</style>
