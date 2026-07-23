<template>
    <div>
        <!-- 项目管理主容器：包含项目列表展示、视图切换、任务抽屉以及增删改操作入口 -->
        <div>
            <el-card class="card" style="border-radius: 20px;max-height: 600px;"shadow="hover">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>项目列表</span>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <!-- 切换项目列表展示方式：表格视图 / 看板视图 -->
                        <el-button-group>
                            <el-button :type="viewMode === 'table' ? 'primary' : 'default'" @click="viewMode = 'table'">表格</el-button>
                            <el-button :type="viewMode === 'kanban' ? 'primary' : 'default'" @click="viewMode = 'kanban'">看板</el-button>
                        </el-button-group>
                        <!-- 只有负责人才能新增项目 -->
                        <el-button v-if="isLeader" type="primary" @click="addDialogVisible = true">新建项目</el-button>
                    </div>
                </div>
                <hr >
                <!-- 表格视图：适合查看项目详情字段 -->
                <template v-if="viewMode === 'table'">
                    <el-row>
                        <el-table :data="list" border style="width:100%">
                            <el-table-column prop="id" label="项目Id" width="110" />
                            <el-table-column prop="name" label="项目名称" width="150" />
                            <el-table-column prop="description" label="项目说明" width="180" />
                            <el-table-column prop="status" label="状态" width="80" />
                            <el-table-column prop="priority" label="优先级" width="80" />
                            <el-table-column prop="ownerId" label="所有者Id" width="80" />
                            <el-table-column prop="startDate" label="开始日期" width="180" />
                            <el-table-column prop="endDate" label="结束日期" width="180" />
                            <el-table-column prop="createTime" label="创建时间" width="180" />
                            <el-table-column label="操作" width="180">
                                <template #default="{row}">
                                    <!-- 负责人可编辑或删除项目 -->
                                    <el-button v-if="isLeader" type="primary" size="small" @click="load(row)">编辑</el-button>
                                    <el-button v-if="isLeader" type="danger" size="small" @click="del(row)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-row>
                </template>

                <!-- 看板视图：以卡片形式直观展示项目基本信息 -->
                <template v-else>
                    <div class="project-board">
                        <el-card v-for="row in list" :key="row.id" class="project-card" shadow="hover">
                            <div class="project-card-header">
                                <div class="project-card-title">{{ row.name }}</div>
                                <el-tag size="small">{{ row.status || '未知状态' }}</el-tag>
                            </div>
                            <div class="project-card-desc">{{ row.description || '暂无项目说明' }}</div>
                            <div class="project-card-meta">优先级：{{ row.priority || '-' }}</div>
                            <div class="project-card-meta">所有者：{{ row.ownerId }}</div>
                            <div class="project-card-meta">开始：{{ row.startDate || '-' }}</div>
                            <div class="project-card-meta">结束：{{ row.endDate || '-' }}</div>
                            <div class="project-card-actions">
                                <!-- 查看当前项目下的任务 -->
                                <el-button type="success" size="small" @click="openTasks(row)">查看任务</el-button>
                                <!-- 负责人可进行编辑和删除 -->
                                <el-button v-if="isLeader" type="primary" size="small" @click="load(row)">编辑</el-button>
                                <el-button v-if="isLeader" type="danger" size="small" @click="del(row)">删除</el-button>
                            </div>
                        </el-card>
                    </div>
                </template>
            </el-card>
        </div>

        <!-- 任务抽屉：点击“查看任务”后展开当前项目的任务管理页面 -->
        <el-drawer v-model="taskDrawerVisible" :title="taskDrawerTitle" size="70%" destroy-on-close>
            <TaskManagement :project-id="selectedProjectId" />
        </el-drawer>

        <div>
            <!-- 新增项目弹窗：用于创建新的项目记录 -->
            <el-dialog v-model="addDialogVisible" title="新增项目信息" width="500" align-center>
                <el-form :model="add_project" label-width="auto" style="max-width: 600px">
                    <el-form-item label="项目Id">
                        <el-input v-model="add_project.id" />
                    </el-form-item>
                    <el-form-item label="项目名称">
                        <el-input v-model="add_project.name" />
                    </el-form-item>
                    <el-form-item label="项目说明">
                        <el-input v-model="add_project.description" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-input v-model="add_project.status" />
                    </el-form-item>
                    <el-form-item label="优先级">
                        <el-input v-model="add_project.priority" />
                    </el-form-item>
                    <el-form-item label="负责者Id">
                        <el-input v-model="add_project.ownerId" />
                    </el-form-item>
                    <el-form-item label="开始日期">
                        <el-date-picker v-model="add_project.startDate" type="date" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="结束日期">
                        <el-date-picker v-model="add_project.endDate" type="date" value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disableAddEndDate" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-date-picker v-model="add_project.createTime" type="date" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button type="primary" @click="add">提交</el-button>
                        <el-button @click="addDialogVisible = false">取消</el-button>
                    </div>
                </template>
            </el-dialog>
        </div>

        <!-- 修改项目弹窗：用于修改已有项目信息 -->
        <div>
            <el-dialog v-model="editDialogVisible" title="修改项目信息" width="500" align-center>
                <el-form :model="edit_project" label-width="auto" style="max-width: 600px">
                    <el-form-item label="项目Id">
                        <el-input v-model="edit_project.id" />
                    </el-form-item>
                    <el-form-item label="项目名称">
                        <el-input v-model="edit_project.name" />
                    </el-form-item>
                    <el-form-item label="项目说明">
                        <el-input v-model="edit_project.description" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-input v-model="edit_project.status" />
                    </el-form-item>
                    <el-form-item label="优先级">
                        <el-input v-model="edit_project.priority" />
                    </el-form-item>
                    <el-form-item label="负责者Id">
                        <el-input v-model="edit_project.ownerId" />
                    </el-form-item>
                    <el-form-item label="开始日期">
                        <el-date-picker v-model="edit_project.startDate" type="date" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="结束日期">
                        <el-date-picker v-model="edit_project.endDate" type="date" value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disableEndDate" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-date-picker v-model="edit_project.createTime" type="date" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                    </el-form-item>
                </el-form>

                <template #footer>
                    <div class="dialog-footer">
                        <el-button type="primary" @click="update">提交</el-button>
                        <el-button @click="editDialogVisible = false">取消</el-button>
                    </div>
                </template>
            </el-dialog>
        </div>

    </div>
</template>

<script>
    import axios from "axios";
    import TaskManagement from "./TaskManagement.vue";

    export default{
        components: { TaskManagement },

        computed: {
            // 当前用户是否具备负责人权限，控制新增/编辑/删除入口的显示
            isLeader() { return this.$store.getters.isLeader },

            // 抽屉标题根据当前选中的项目动态显示
            taskDrawerTitle() {
                const p = this.list.find(item => item.id === this.selectedProjectId)
                return p ? `项目任务 - ${p.name}` : '项目任务列表'
            }
        },

        data(){
            return{
                // 项目列表数据
                list:[],

                // 当前列表展示模式：table / kanban
                viewMode:'table',

                // 控制任务抽屉的显示与否
                taskDrawerVisible:false,

                // 当前选中的项目 ID，用于在抽屉中展示对应项目任务
                selectedProjectId:null,

                // 新增项目弹窗状态
                addDialogVisible:false,

                // 编辑项目弹窗状态
                editDialogVisible:false,

                // 新增项目表单数据
                add_project:{
                        id:0,
                        name: '',
                        description: '',
                        status: '',
                        priority: '',
                        ownerId:2,
                        startDate: '',
                        endDate: '',
                        createTime: ''
                    },

                // 编辑项目表单数据
                edit_project:{
                        id:0,
                        name: '',
                        description: '',
                        status: '',
                        priority: '',
                        ownerId:2,
                        startDate: '',
                        endDate: '',
                        createTime: ''
                    },
            }
        },

        created(){
            // 页面加载时拉取项目列表
            this.List()
        },

        methods:{
        // 获取项目列表
        List(){
            axios.get("http://localhost:9000/project/list")
            .then(data=>this.list=data.data)
            .catch(err=>console.log(err))
        },

        // 新增项目
        add(){
            axios.post("http://localhost:9000/project/add",this.add_project)
            .then(data=>{
                        this.addDialogVisible=false
                        alert('添加成功')
                        this.List()
                    })
            .catch(err=>console.log(err))
        },

        // 根据项目 ID 加载项目信息并打开编辑弹窗
        load(row){
            axios.get("http://localhost:9000/project/one/"+row.id)
            .then(data=>{
            this.edit_project=data.data
            this.editDialogVisible=true
            })
            .catch(err=>console.log(err))
        },

        // 更新项目信息
        update(){
            axios.put("http://localhost:9000/project/update",this.edit_project)
            .then(data=>{
                        this.editDialogVisible=false
                        alert('修改成功')
                        this.List()
                    })
            .catch(err=>console.log(err))
        },

        // 删除项目
        del(row){
            axios.delete("http://localhost:9000/project/delete/"+row.id)
            .then(data=>{
                        alert('删除成功')
                        this.List()
                    })
            .catch(err=>console.log(err))
        },

        // 打开当前项目的任务列表抽屉
        openTasks(row){
            this.selectedProjectId = row.id
            this.taskDrawerVisible = true
        },

        // 限制编辑弹窗中结束日期不能早于开始日期
        disableEndDate(time) {
            if (!this.edit_project.startDate) return false
            const start = new Date(this.edit_project.startDate).setHours(0, 0, 0, 0)
            return time.getTime() <= start        },

        // 限制新增弹窗中结束日期不能早于开始日期
        disableAddEndDate(time) {
            if (!this.add_project.startDate) return false
            const start = new Date(this.add_project.startDate).setHours(0, 0, 0, 0)
            return time.getTime() <= start        }
        }
    }
</script>

<style scoped>
.project-board { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; padding: 8px 0; }
.project-card { border-radius: 14px; }
.project-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px; }
.project-card-title { font-size: 16px; font-weight: 600; color: #303133; }
.project-card-desc { min-height: 44px; color: #606266; margin-bottom: 10px; }
.project-card-meta { font-size: 13px; color: #909399; line-height: 1.8; }
.project-card-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top: 12px; }
</style>