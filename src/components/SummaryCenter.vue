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
				<el-table-column label="所属项目" width="120">
					<template #default="{ row }">{{ getProjectName(row.projectId) }}</template>
				</el-table-column>
				<el-table-column label="关联任务" width="140">
					<template #default="{ row }">{{ getTaskName(row.taskId) }}</template>
				</el-table-column>
				<el-table-column label="总结类型" width="100">
					<template #default="{ row }"><el-tag :type="row.summaryType === '最终总结' ? 'success' : 'warning'" size="small">{{ row.summaryType || '阶段总结' }}</el-tag></template>
				</el-table-column>
				<el-table-column prop="content" label="总结内容" min-width="300" show-overflow-tooltip />
				<el-table-column label="创建人" width="100"><template #default="{ row }">{{ getUserName(row.createdBy) }}</template></el-table-column>
				<el-table-column prop="createTime" label="创建时间" width="170" />
				<el-table-column label="操作" width="180" fixed="right">
					<template #default="{ row }">
						<el-button type="primary" size="small" @click="openEdit(row)">编辑</el-button>
						<el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="dialogVisible" :title="isEdit ? '编辑总结' : '新建总结'" width="600px" align-center @closed="resetForm">
			<el-form :model="form" label-width="100px">
				<el-form-item label="所属项目">
					<el-select v-model="form.projectId" style="width: 100%" @change="form.taskId = null">
						<el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" />
					</el-select>
				</el-form-item>
				<el-form-item label="关联任务">
					<el-select v-model="form.taskId" clearable style="width: 100%">
						<el-option v-for="t in filteredTasks" :key="t.id" :label="t.title" :value="t.id" />
					</el-select>
				</el-form-item>
				<el-form-item label="总结类型">
					<el-radio-group v-model="form.summaryType">
						<el-radio label="阶段总结">阶段总结</el-radio>
						<el-radio label="最终总结">最终总结</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="总结内容">
					<el-input v-model="form.content" type="textarea" :rows="6" placeholder="请在此撰写总结内容..." />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button type="primary" @click="handleSubmit">提交</el-button>
				<el-button @click="dialogVisible = false">取消</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import axios from "axios";
export default {
	data() {
		return {
			list: [], projectList: [], taskList: [], userList: [],
			loading: false, dialogVisible: false, isEdit: false, filterProjectId: null,
			form: { id: null, projectId: null, taskId: null, summaryType: '阶段总结', content: '' }
		}
	},
	computed: {
		filteredList() {
			return this.filterProjectId ? this.list.filter(i => i.projectId === this.filterProjectId) : this.list
		},
		filteredTasks() {
			return this.form.projectId ? this.taskList.filter(t => t.projectId === this.form.projectId) : this.taskList
		}
	},
	mounted() {
		this.fetchProjects()
		this.fetchTasks()
		this.fetchUsers()
		this.fetchList()
	},
	methods: {
		getProjectName(id) { const p = this.projectList.find(p => p.id === id); return p ? p.name : '#' + id },
		getUserName(id) { const u = this.userList.find(u => u.id === id); return u ? (u.realName || u.username) : '#' + id },
		getTaskName(id) { const t = this.taskList.find(t => t.id === id); return t ? t.title : '未关联' },
		fetchList() {
			this.loading = true
			axios.get("http://localhost:9000/summary/list")
				.then(res => { this.list = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => { alert('获取失败'); console.log(err) })
				.finally(() => this.loading = false)
		},
		fetchProjects() {
			axios.get("http://localhost:9000/project/list")
				.then(res => { this.projectList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
				.catch(err => console.log(err))
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
			this.isEdit = false
			this.form = { id: null, projectId: this.filterProjectId || (this.projectList[0]?.id || null), taskId: null, summaryType: '阶段总结', content: '' }
			this.dialogVisible = true
		},
		openEdit(row) {
			this.isEdit = true
			this.form = { ...row }
			this.dialogVisible = true
		},
		resetForm() { this.form = { id: null, projectId: null, taskId: null, summaryType: '阶段总结', content: '' } },
		handleSubmit() {
			if (!this.form.projectId) { alert('请选择项目'); return }
			if (!this.form.content.trim()) { alert('请填写内容'); return }
			const url = this.isEdit ? "http://localhost:9000/summary/update" : "http://localhost:9000/summary/add"
			const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
			const data = { ...this.form, currentUserId: user.id }
			const method = this.isEdit ? 'put' : 'post'
			axios({ method, url, data }).then(res => {
				alert(res.data?.message || (this.isEdit ? '编辑成功' : '创建成功'))
				this.dialogVisible = false
				this.fetchList()
			}).catch(err => { alert('操作失败'); console.log(err) })
		},
		handleDelete(row) {
			if (!confirm('确定删除该总结吗？')) return
			axios.delete("http://localhost:9000/summary/delete/" + row.id)
				.then(res => { alert(res.data?.message || '删除成功'); this.fetchList() })
				.catch(err => { alert('删除失败'); console.log(err) })
		}
	}
}
</script>

<style scoped>.card { width: 100%; }</style>
