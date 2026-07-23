<template>
	<div class="login-container">
		<el-card class="login-card" shadow="hover">
			<div class="login-header">
				<h1>FlowSync</h1>
				<p>小组任务协同系统</p>
			</div>
			<el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="large">
				<el-form-item prop="username">
					<el-input v-model="form.username" placeholder="请输入用户名" />
				</el-form-item>
				<el-form-item prop="password">
					<el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
						{{ loading ? '登录中...' : '登 录' }}
					</el-button>
				</el-form-item>
			</el-form>
			<div style="text-align: center; color: #909399; font-size: 13px; margin-top: 16px;">
				<p>预置账号：leader / member1 / member2</p>
				<p>密码均为：123456</p>
			</div>
		</el-card>
	</div>
</template>

<script>
import axios from "axios";
export default {
	data() {
		return {
			form: { username: '', password: '' },
			loading: false,
			rules: {
				username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
				password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
			}
		}
	},
	methods: {
		handleLogin() {
			this.$refs.formRef.validate(valid => {
				if (!valid) return
				this.loading = true
				axios.post("http://localhost:9000/auth/login", {
					username: this.form.username,
					password: this.form.password
				}).then(res => {
					if (res.data.code === 100 && res.data.data) {
						const user = res.data.data
						sessionStorage.setItem('currentUser', JSON.stringify(user))
						this.$store.commit('SET_CURRENT_USER', user)
						alert('登录成功')
						const redirect = this.$route.query.redirect || '/overview'
						this.$router.push(redirect)
					} else {
						alert(res.data.message || '登录失败')
					}
				}).catch(err => {
					alert('登录失败，请检查网络连接')
					console.log(err)
				}).finally(() => this.loading = false)
			})
		}
	}
}
</script>

<style scoped>
.login-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
	width: 420px;
	padding: 20px 30px;
	border-radius: 12px;
}
.login-header {
	text-align: center;
	margin-bottom: 30px;
}
.login-header h1 {
	font-size: 32px;
	color: #303133;
	margin: 0 0 8px 0;
}
.login-header p {
	font-size: 14px;
	color: #909399;
	margin: 0;
}
</style>
