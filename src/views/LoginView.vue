<template>
	<div class="login-container">
		<el-card class="login-card" shadow="hover">
			<div class="login-header">
				<h1>FlowSync</h1>
				<p>{{ isRegister ? '注册新账号' : '小组任务协同系统' }}</p>
			</div>
			<el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="large">
				<el-form-item prop="username">
					<el-input v-model="form.username" placeholder="请输入用户名" />
				</el-form-item>
				<el-form-item v-if="isRegister" prop="realName">
					<el-input v-model="form.realName" placeholder="请输入真实姓名" />
				</el-form-item>
				<el-form-item prop="password">
					<el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
				</el-form-item>
				<el-form-item v-if="isRegister" prop="confirmPassword">
					<el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" show-password />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :loading="loading" @click="handleSubmit" style="width: 100%">
						{{ loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注 册' : '登 录') }}
					</el-button>
				</el-form-item>
			</el-form>
			<div class="login-hint" v-if="!isRegister">
				<p>预置账号：leader / member1 / member2</p>
				<p>密码均为：123456</p>
			</div>
			<div class="login-toggle">
				<span v-if="!isRegister">没有账号？<a href="javascript:void(0)" @click="toggleMode">立即注册</a></span>
				<span v-else>已有账号？<a href="javascript:void(0)" @click="toggleMode">返回登录</a></span>
			</div>
		</el-card>
	</div>
</template>

<script>
import axios from "axios";
export default {
	data() {
		return {
			isRegister: false,
			form: { username: '', password: '', realName: '', confirmPassword: '' },
			loading: false,
			rules: {
				username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
				password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 4, message: '密码至少4位', trigger: 'blur' }]
			}
		}
	},
	methods: {
		toggleMode() {
			this.isRegister = !this.isRegister
			this.form = { username: '', password: '', realName: '', confirmPassword: '' }
			this.$refs.formRef?.resetFields()
		},
		handleSubmit() {
			this.$refs.formRef.validate(valid => {
				if (!valid) return
				if (this.isRegister) {
					this.handleRegister()
				} else {
					this.handleLogin()
				}
			})
		},
		handleLogin() {
			this.loading = true
			axios.post("http://localhost:9000/auth/login", { username: this.form.username, password: this.form.password })
				.then(res => {
					if (res.data.code === 100 && res.data.data) {
						const user = res.data.data
						sessionStorage.setItem('currentUser', JSON.stringify(user))
						this.$store.commit('SET_CURRENT_USER', user)
						alert('登录成功')
						this.$router.push(this.$route.query.redirect || '/overview')
					} else {
						alert(res.data.message || '登录失败')
					}
				})
				.catch(() => alert('登录失败，请检查网络连接'))
				.finally(() => this.loading = false)
		},
		handleRegister() {
			if (this.form.password !== this.form.confirmPassword) {
				alert('两次输入的密码不一致')
				return
			}
			this.loading = true
			axios.post("http://localhost:9000/auth/register", {
				username: this.form.username,
				password: this.form.password,
				realName: this.form.realName
			}).then(res => {
				if (res.data.code === 100) {
					alert('注册成功，请登录')
					this.toggleMode()
				} else {
					alert(res.data.message || '注册失败')
				}
			})
			.catch(() => alert('注册失败，请检查网络连接'))
			.finally(() => this.loading = false)
		}
	}
}
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.login-card { width: 420px; padding: 20px 30px; border-radius: 12px; }
.login-header { text-align: center; margin-bottom: 30px; }
.login-header h1 { font-size: 32px; color: #303133; margin: 0 0 8px 0; }
.login-header p { font-size: 14px; color: #909399; margin: 0; }
.login-hint { text-align: center; color: #909399; font-size: 13px; margin-top: 16px; }
.login-toggle { text-align: center; margin-top: 16px; font-size: 13px; color: #909399; }
.login-toggle a { color: #409eff; cursor: pointer; text-decoration: none; }
</style>
