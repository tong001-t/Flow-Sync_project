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
				.then(res => { this.list = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
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
			axios.post("http://localhost:9000/task-log/add", data)
				.then(res => { alert(res.data?.message || '添加成功'); this.dialogVisible = false; this.fetchList() })
				.catch(err => { alert('操作失败'); console.log(err) })
		}
	}
}
</script>

<style scoped>.card { width: 100%; }</style>
