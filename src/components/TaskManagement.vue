<template>
    <div>
        <!-- 任务管理主视图：提供表格/日历两种展示方式，并支持按项目筛选与任务增删改 -->
        <el-card class="card" style="border-radius: 20px;max-height: 600px;" shadow="hover">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>任务列表</span>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <!-- 当前项目上下文提示 -->
                    <el-tag v-if="!projectId" type="info">当前项目：{{ getProjectName(filterProjectId) }}</el-tag>

                    <!-- 视图切换：表格视图 / 日历视图 -->
                    <el-button-group>
                        <el-button :type="viewMode === 'table' ? 'primary' : 'default'" @click="viewMode = 'table'">表格</el-button>
                        <el-button :type="viewMode === 'calendar' ? 'primary' : 'default'" @click="viewMode = 'calendar'">日历</el-button>
                    </el-button-group>

                    <!-- 仅在未指定项目时显示项目筛选器 -->
                    <el-select v-if="!projectId" v-model="filterProjectId" placeholder="按项目创建" clearable style="width: 200px" @change="fetchList">
                        <el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" />
                    </el-select>

                    <!-- 负责人可创建任务 -->
                    <el-button v-if="isLeader" type="primary" @click="openAdd">新建任务</el-button>
                </div>
            </div>
            <hr />

            <!-- 表格视图：适合查看任务的完整字段信息 -->
            <template v-if="viewMode === 'table'">
                <el-table :data="list" border style="width:100%" v-loading="loading">
                    <el-table-column prop="id" label="ID" width="60" />
                    <el-table-column prop="title" label="任务标题" min-width="100" show-overflow-tooltip />
                    <el-table-column label="所属项目" width="120"><template #default="{ row }">{{ getProjectName(row.projectId) }}</template></el-table-column>
                    <el-table-column label="负责人" width="100"><template #default="{ row }">{{ getUserName(row.assigneeId) }}</template></el-table-column>
                    <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ row.status || '未开始' }}</el-tag></template></el-table-column>
                    <el-table-column label="优先级" width="80"><template #default="{ row }"><el-tag :type="priorityType(row.priority)" size="small">{{ row.priority || '中' }}</el-tag></template></el-table-column>
                    <el-table-column prop="dueDate" label="截止日期" width="120" />
                    <el-table-column label="操作" fixed="right">
                        <template #default="{ row }">
                            <!-- 负责人可编辑；任务执行人可更新自身任务状态 -->
                            <el-button v-if="isLeader || row.assigneeId === currentUserId" type="primary" @click="openEdit(row)">{{ isLeader ? '编辑' : '更新状态' }}</el-button>
                            <el-button v-if="isLeader" type="danger" @click="handleDelete(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </template>

            <!-- 日历视图：以日期维度展示任务分布 -->
            <template v-else>
                <div class="calendar-wrapper">
                    <TaskCalendar :tasks="list" />
                </div>
            </template>
        </el-card>

        <!-- 任务弹窗：用于新增或编辑任务 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" align-center @closed="resetForm">
            <el-form :model="form" label-width="100px">
                <!-- 只有负责人能修改项目归属和任务基础信息 -->
                <el-form-item v-if="isLeader" label="所属项目"><el-select v-model="form.projectId" style="width: 100%"><el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" /></el-select></el-form-item>
                <el-form-item label="任务标题"><el-input v-model="form.title" :disabled="!isLeader" /></el-form-item>
                <el-form-item label="任务说明"><el-input v-model="form.description" type="textarea" :rows="3" :disabled="!isLeader" /></el-form-item>
                <el-form-item v-if="isLeader" label="负责人"><el-select v-model="form.assigneeId" style="width: 100%"><el-option v-for="u in userList" :key="u.id" :label="u.realName || u.username" :value="u.id" /></el-select></el-form-item>
                <el-form-item label="状态"><el-select v-model="form.status" style="width: 100%"><el-option label="未开始" value="未开始" /><el-option label="进行中" value="进行中" /><el-option label="已完成" value="已完成" /></el-select></el-form-item>
                <el-form-item v-if="isLeader" label="优先级"><el-select v-model="form.priority" style="width: 100%"><el-option label="低" value="低" /><el-option label="中" value="中" /><el-option label="高" value="高" /></el-select></el-form-item>
                <el-form-item v-if="isLeader" label="截止日期"><el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /></el-form-item>
            </el-form>
            <template #footer><el-button type="primary" @click="handleSubmit">提交</el-button><el-button @click="dialogVisible = false">取消</el-button></template>
        </el-dialog>
    </div>
</template>

<script>
import axios from "axios";
import TaskCalendar from "./TaskCalendar.vue";

export default {
    components: { TaskCalendar },

    props: {
        // 从项目详情入口传入的项目 ID，用于限定当前任务列表范围
        projectId: {
            type: [String, Number],
            default: null
        }
    },

    data() {
        return {
            // 任务列表数据
            list: [],

            // 所有项目数据，用于筛选和显示项目名称
            projectList: [],

            // 所有用户数据，用于显示负责人姓名
            userList: [],

            // 页面加载状态
            loading: false,

            // 控制任务弹窗显示
            dialogVisible: false,

            // 当前筛选的项目 ID
            filterProjectId: null,

            // 当前是新增还是编辑
            isEdit: false,

            // 当前展示模式：table / calendar
            viewMode: 'table',

            // 任务表单数据
            form: { id: null, projectId: null, title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' }
        }
    },

    computed: {
        // 当前用户是否为负责人
        isLeader() { return this.$store.getters.isLeader },

        // 当前登录用户 ID，用于控制“更新状态”权限
        currentUserId() { return this.$store.getters.currentUserId },

        // 弹窗标题根据当前操作类型和权限动态变化
        dialogTitle() { return !this.isEdit ? '新建任务' : (this.isLeader ? '编辑任务' : '更新任务状态') }
    },

    mounted() {
        // 初始化项目、用户数据并拉取任务列表
        this.fetchProjects()
        this.fetchUsers()
        this.syncProjectFilter(this.projectId || this.$route?.query?.projectId)
        this.fetchList()
    },

    watch: {
        // 当父组件传入项目 ID 时，同步筛选条件并刷新列表
        projectId: {
            immediate: false,
            handler(val) {
                this.syncProjectFilter(val)
                this.fetchList()
            }
        },

        // 当路由中带有 projectId 查询参数时，同步筛选条件
        '$route.query.projectId': {
            immediate: false,
            handler(val) {
                if (this.projectId !== null && this.projectId !== undefined && this.projectId !== '') return
                this.syncProjectFilter(val)
                this.fetchList()
            }
        }
    },

    methods: {
        // 将外部传入的项目 ID 转换为数值格式，便于筛选
        syncProjectFilter(val) {
            if (val === undefined || val === null || val === '') return
            this.filterProjectId = isNaN(Number(val)) ? val : Number(val)
        },

        // 根据项目 ID 获取项目名称
        getProjectName(id) { const p = this.projectList.find(p => p.id === id); return p ? p.name : '#' + id },

        // 根据用户 ID 获取用户姓名
        getUserName(id) { const u = this.userList.find(u => u.id === id); return u ? (u.realName || u.username) : '#' + id },

        // 根据任务状态返回不同的标签样式
        statusType(s) { return s === '已完成' ? 'success' : (s === '进行中' ? 'warning' : 'info') },

        // 根据优先级返回不同的标签样式
        priorityType(p) { return p === '高' ? 'danger' : (p === '中' ? 'warning' : 'info') },

        // 获取任务列表，可按项目筛选
        fetchList() {
            this.loading = true
            const params = this.filterProjectId ? { projectId: this.filterProjectId } : {}
            axios.get("http://localhost:9000/task/list", { params })
                .then(res => { this.list = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
                .catch(err => { alert('获取任务列表失败'); console.log(err) })
                .finally(() => this.loading = false)
        },

        // 获取项目列表，用于下拉框和项目名称映射
        fetchProjects() {
            axios.get("http://localhost:9000/project/list")
                .then(res => { this.projectList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
                .catch(err => console.log(err))
        },

        // 获取用户列表，用于负责人选择
        fetchUsers() {
            axios.get("http://localhost:9000/user/list")
                .then(res => { this.userList = Array.isArray(res.data) ? res.data : (res.data?.data || []) })
                .catch(err => console.log(err))
        },

        // 打开新增任务弹窗，并初始化默认表单
        openAdd() {
            this.isEdit = false
            this.form = { id: null, projectId: this.filterProjectId || (this.projectList[0]?.id || null), title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' }
            this.dialogVisible = true
        },

        // 打开编辑任务弹窗，并回填当前任务信息
        openEdit(row) {
            this.isEdit = true
            this.form = { ...row, dueDate: row.dueDate || '' }
            this.dialogVisible = true
        },

        // 重置表单状态
        resetForm() { this.form = { id: null, projectId: null, title: '', description: '', assigneeId: null, status: '未开始', priority: '中', dueDate: '' } },

        // 提交新增/更新任务
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

        // 删除任务
        handleDelete(row) {
            if (!confirm('确定删除"' + row.title + '"？')) return
            axios.delete("http://localhost:9000/task/delete/" + row.id)
                .then(res => { alert(res.data?.message || '删除成功'); this.fetchList() })
                .catch(err => { alert('删除失败'); console.log(err) })
        }
    }
}
</script>

<style scoped>.card { width: 100%; }.calendar-wrapper { padding: 8px 0; }</style>
