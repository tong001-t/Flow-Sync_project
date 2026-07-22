<template>
	<div style="display: flex; gap: 20px; flex-wrap: wrap;">
		<el-card class="info-card" style="border-radius: 20px; flex: 1; min-width: 400px;" shadow="hover">
			<span>个人信息</span><hr />
			<el-descriptions :column="1" border style="margin-top: 16px;">
				<el-descriptions-item label="用户名">{{ user.username || '—' }}</el-descriptions-item>
				<el-descriptions-item label="真实姓名">{{ user.realName || '—' }}</el-descriptions-item>
				<el-descriptions-item label="角色"><el-tag :type="user.role === '负责人' ? 'danger' : 'info'" size="small">{{ user.role || '—' }}</el-tag></el-descriptions-item>
				<el-descriptions-item label="电话">{{ user.phone || '未填写' }}</el-descriptions-item>
				<el-descriptions-item label="邮箱">{{ user.email || '未填写' }}</el-descriptions-item>
				<el-descriptions-item label="创建时间">{{ user.createTime || '—' }}</el-descriptions-item>
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

<script>
import axios from "axios";
export default {
	data() {
		const validateConfirm = (rule, value, callback) => {
			callback(value !== this.passwordForm.newPassword ? new Error('两次密码不一致') : undefined)
		}
		return {
			user: {},
			submitting: false,
			passwordForm: { oldPassword: '', newPassword: '', confirmPassword: '' },
			rules: {
				oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
				newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' }],
				confirmPassword: [{ required: true, message: '请再次输入', trigger: 'blur' }, { validator: validateConfirm, trigger: 'blur' }]
			}
		}
	},
	mounted() {
		const stored = sessionStorage.getItem('currentUser')
		if (stored) { try { this.user = JSON.parse(stored) } catch (e) {} }
	},
	methods: {
		handleUpdatePassword() {
			this.$refs.formRef.validate(valid => {
				if (!valid) return
				this.submitting = true
				const userId = this.user.id
				axios.post("http://localhost:9000/user/update-password", {
					currentUserId: userId,
					oldPassword: this.passwordForm.oldPassword,
					newPassword: this.passwordForm.newPassword
				}).then(res => {
					if (res.data.code === 100) {
						alert('密码修改成功')
						this.resetPasswordForm()
					} else {
						alert(res.data.message || '修改失败')
					}
				}).catch(err => {
					alert('操作失败')
					console.log(err)
				}).finally(() => this.submitting = false)
			})
		},
		resetPasswordForm() {
			this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
			this.$refs.formRef?.resetFields()
		}
	}
}
</script>

<style scoped>.info-card { width: 100%; }</style>
