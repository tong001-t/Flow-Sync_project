<template>
	<div>
		<el-card class="card" style="border-radius: 20px" shadow="hover">
			<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
				<span>成员列表</span>
				<el-input v-model="searchKeyword" placeholder="搜索用户名" clearable prefix-icon="Search" style="width: 220px" />
			</div>
			<hr />
			<el-table :data="filteredList" border style="width: 100%" v-loading="loading">
				<el-table-column prop="id" label="ID" width="60" />
				<el-table-column prop="username" label="用户名" width="120" />
				<el-table-column prop="realName" label="真实姓名" width="120" />
				<el-table-column label="角色" width="120"><template #default="{ row }"><el-tag :type="row.role === '负责人' ? 'danger' : 'info'" size="small">{{ row.role || '成员' }}</el-tag></template></el-table-column>
				<el-table-column prop="phone" label="电话" width="140"><template #default="{ row }">{{ row.phone || '未填写' }}</template></el-table-column>
				<el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip><template #default="{ row }">{{ row.email || '未填写' }}</template></el-table-column>
				<el-table-column prop="createTime" label="创建时间" width="170" />
			</el-table>
		</el-card>
	</div>
</template>

<script>
import axios from "axios";
export default {
	data() {
		return {
			list: [],
			loading: false,
			searchKeyword: ''
		}
	},
	computed: {
		filteredList() {
			if (!this.searchKeyword) return this.list
			const kw = this.searchKeyword.toLowerCase()
			return this.list.filter(u => u.username && u.username.toLowerCase().includes(kw))
		}
	},
	mounted() {
		this.fetchList()
	},
	methods: {
		fetchList() {
			this.loading = true
			axios.get("http://localhost:9000/user/list")
				.then(res => {
					this.list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
				})
				.catch(err => {
					alert('获取失败')
					console.log(err)
				})
				.finally(() => this.loading = false)
		}
	}
}
</script>

<style scoped>.card { width: 100%; }</style>
