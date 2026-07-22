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
			<el-table :data="list" border style="width:100%" v-loading="loading">
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

<script>
import axios from "axios";
export default {
	data() {
		return {
			list: [], projectList: [], userList: [],
			loading: false, dialogVisible: false, filterProjectId: null, isEdit: false,
			form: { id: null, projectId: null, title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' }
		}
	},
	computed: {
		isLeader() { return this.$store.getters.isLeader },
		currentUserId() { return this.$store.getters.currentUserId },
		dialogTitle() { return !this.isEdit ? '新建任务' : (this.isLeader ? '编辑任务' : '更新任务状态') }
	},
	mounted() {
		this.fetchProjects()
		this.fetchUsers()
		this.fetchList()
	},
	methods: {
		getProjectName(id) { const p = this.projectList.find(p => p.id === id); return p ? p.name : '#' + id },
		getUserName(id) { const u = this.userList.find(u => u.id === id); return u ? (u.realName || u.username) : '#' + id },
		statusType(s) { return s === '已完成' ? 'success' : (s === '进行中' ? 'warning' : 'info') },
		priorityType(p) { return p === '高' ? 'danger' : (p === '中' ? 'warning' : 'info') },
		fetchList() {
			this.loading = true
			const params = this.filterProjectId ? { projectId: this.filterProjectId } : {}
			axios.get("http://localhost:9000/task/list", { params })
				.then(res => { this.list = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => { alert('获取任务列表失败'); console.log(err) })
				.finally(() => this.loading = false)
		},
		fetchProjects() {
			axios.get("http://localhost:9000/project/list")
				.then(res => { this.projectList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => console.log(err))
		},
		fetchUsers() {
			axios.get("http://localhost:9000/user/list")
				.then(res => { this.userList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => console.log(err))
		},
		openAdd() {
			this.isEdit = false
			this.form = { id: null, projectId: this.filterProjectId || (this.projectList[0]?.id || null), title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' }
			this.dialogVisible = true
		},
		openEdit(row) {
			this.isEdit = true
			this.form = { ...row, dueDate: row.dueDate || '' }
			this.dialogVisible = true
		},
		resetForm() { this.form = { id: null, projectId: null, title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' } },
		handleSubmit() {
			if (!this.form.title) { alert('请输入任务标题'); return }
			const url = this.isEdit ? "http://localhost:9000/task/update" : "http://localhost:9000/task/add"
			const method = this.isEdit ? 'put' : 'post'
			const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
			const data = { ...this.form, creatorId: user.id, currentUserId: user.id }
			axios({ method, url, data }).then(res => {
				alert(res.data?.message || (this.isEdit ? '更新成功' : '创建成功'))
				this.dialogVisible = false
				this.fetchList()
			}).catch(err => { alert('操作失败'); console.log(err) })
		},
		handleDelete(row) {
			if (!confirm('确定删除"' + row.title + '"？')) return
			axios.delete("http://localhost:9000/task/delete/" + row.id)
				.then(res => { alert(res.data?.message || '删除成功'); this.fetchList() })
				.catch(err => { alert('删除失败'); console.log(err) })
		}
	}
}
</script>

<style scoped>.card { width: 100%; }</style>
