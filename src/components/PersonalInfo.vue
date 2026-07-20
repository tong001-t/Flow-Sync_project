<template>
  <div style="display: flex; gap: 20px; flex-wrap: wrap;">
    <el-card class="info-card" style="border-radius: 20px; flex: 1; min-width: 400px;" shadow="hover">
      <span>个人信息</span><hr />
      <el-descriptions :column="1" border style="margin-top: 16px;">
        <el-descriptions-item label="用户名">{{ currentUser?.username || '—' }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ currentUser?.realName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="角色"><el-tag :type="currentUser?.role === '负责人' ? 'danger' : 'info'" size="small">{{ currentUser?.role || '—' }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentUser?.phone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser?.email || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentUser?.createTime || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="info-card" style="border-radius: 20px; flex: 1; min-width: 400px;" shadow="hover">
      <span>修改密码</span><hr />
      <el-form ref="formRef" :model="passwordForm" :rules="rules" label-width="120px" style="max-width: 450px; margin-top: 16px;">
        <el-form-item label="旧密码" prop="oldPassword"><el-input v-model="passwordForm.oldPassword" type="password" show-password /></el-form-item>
        <el-form-item label="新密码" prop="newPassword"><el-input v-model="passwordForm.newPassword" type="password" show-password /></el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword"><el-input v-model="passwordForm.confirmPassword" type="password" show-password /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleUpdatePassword" :loading="submitting">确认修改</el-button><el-button @click="resetPasswordForm">重置</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const store = useStore()
const currentUser = computed(() => store.getters.currentUser)
const formRef = ref(null); const submitting = ref(false)

const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const validateConfirm = (rule, value, callback) => callback(value !== passwordForm.newPassword ? new Error('两次密码不一致') : undefined)
const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请再次输入', trigger: 'blur' }, { validator: validateConfirm, trigger: 'blur' }]
}

const handleUpdatePassword = async () => {
  if (!await formRef.value.validate().catch(() => false)) return
  submitting.value = true
  try {
    const r = await store.dispatch('updatePassword', { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
    r.success ? ElMessage.success(r.message || '修改成功') : ElMessage.error(r.message || '修改失败')
    if (r.success) resetPasswordForm()
  } catch (e) { ElMessage.error('操作失败') } finally { submitting.value = false }
}
const resetPasswordForm = () => { passwordForm.oldPassword = ''; passwordForm.newPassword = ''; passwordForm.confirmPassword = ''; formRef.value?.resetFields() }
</script>

<style scoped>.info-card { width: 100%; }</style>
