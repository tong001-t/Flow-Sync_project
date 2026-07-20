<template>
  <div>
    <el-card class="card" style="border-radius: 20px" shadow="hover">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><span>成员列表</span></div>
      <hr />
      <el-table :data="list" border style="width: 100%" v-loading="loading">
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

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userAPI } from '@/api'

const list = ref([]); const loading = ref(false)

const fetchList = async () => { loading.value = true; try { const res = await userAPI.list(); list.value = Array.isArray(res.data) ? res.data : (res.data?.data || []) } catch (e) { ElMessage.error('获取失败') } finally { loading.value = false } }

onMounted(() => fetchList())
</script>

<style scoped>.card { width: 100%; }</style>
