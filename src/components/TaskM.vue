<template>
    <div>
        <div>
            <el-card class="card" style="border-radius: 20px "shadow="hover">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>任务信息列表</span>
                <el-button type="primary" @click="addDialogVisible = true">新建任务</el-button>
                </div>
                <hr >
                <el-row>
                    <el-table :data="list" border height="500px" style="width:100%">
                        <el-table-column prop="id" label="任务Id" width="80" />
                        <el-table-column prop="projectId" label="所属项目Id" width="100" />
                        <el-table-column prop="parentId" label="父Id" width="100" />
                        <el-table-column prop="title" label="任务标题" width="180" />
                        <el-table-column prop="description" label="任务说明" width="280" />
                        <el-table-column prop="assigneeId" label="负责人Id" width="80" />
                        <el-table-column prop="creatorId" label="创建人Id" width="80" />
                        <el-table-column prop="status" label="任务状态" width="80" />
                        <el-table-column prop="priority" label="优先级" width="180" />
                        <el-table-column prop="dueDate" label="截止日期" width="180" />
                        <el-table-column prop="aiSuggestion" label="千问建议" width="180" />
                        <el-table-column prop="createTime" label="创建时间" width="180" />
                        <el-table-column label="操作" width="180">
                            <template #default="{row}">
                                <el-button type="primary" @click="load(row)">编辑</el-button>
                                <el-button type="danger" @click="del(row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
            </el-card>
        </div>
     <div>
            <!-- 新增对话框 -->
            <el-dialog v-model="addDialogVisible" title="新增项目信息" width="500" align-center>
                <el-form :model="add_project" label-width="auto" style="max-width: 600px">
                    <el-form-item label="任务Id">
                        <el-input v-model="add_project.id" />
                    </el-form-item>
                    <el-form-item label="所属项目Id">
                        <el-input v-model="add_project.projectId" />
                    </el-form-item>
                    <el-form-item label="父Id">
                        <el-input v-model="add_project.parentId" />
                    </el-form-item>
                    <el-form-item label="任务标题">
                        <el-input v-model="add_project.title" />
                    </el-form-item>
                    <el-form-item label="任务说明">
                        <el-input v-model="add_project.description" />
                    </el-form-item>
                    <el-form-item label="负责人Id">
                        <el-input v-model="add_project.assigneeId" />
                    </el-form-item>
                    <el-form-item label="创建人Id">
                        <el-input v-model="add_project.creatorId" />
                    </el-form-item>
                    <el-form-item label="任务状态">
                        <el-input v-model="add_project.status" />
                    </el-form-item>
                    <el-form-item label="优先级">
                        <el-input v-model="add_project.priority" />
                    </el-form-item>
                    <el-form-item label="截止日期">
                        <el-input v-model="add_project.dueDate" />
                    </el-form-item>
                    <el-form-item label="千问建议">
                        <el-input v-model="add_project.aiSuggestion" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="add_project.createTime" />
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

        <!-- 修改对话框 -->
     <div>
            <el-dialog v-model="editDialogVisible" title="修改项目信息" width="500" align-center>
                <el-form :model="edit_project" label-width="auto" style="max-width: 600px">
                    <el-form-item label="任务Id">
                        <el-input v-model="edit_project.id" />
                    </el-form-item>
                    <el-form-item label="所属项目Id">
                        <el-input v-model="edit_project.projectId" />
                    </el-form-item>
                    <el-form-item label="父Id">
                        <el-input v-model="edit_project.parentId" />
                    </el-form-item>
                    <el-form-item label="任务标题">
                        <el-input v-model="edit_project.title" />
                    </el-form-item>
                    <el-form-item label="任务说明">
                        <el-input v-model="edit_project.description" />
                    </el-form-item>
                    <el-form-item label="负责人Id">
                        <el-input v-model="edit_project.assigneeId" />
                    </el-form-item>
                    <el-form-item label="创建人Id">
                        <el-input v-model="edit_project.creatorId" />
                    </el-form-item>
                    <el-form-item label="任务状态">
                        <el-input v-model="edit_project.status" />
                    </el-form-item>
                    <el-form-item label="优先级">
                        <el-input v-model="edit_project.priority" />
                    </el-form-item>
                    <el-form-item label="截止日期">
                        <el-input v-model="edit_project.dueDate" />
                    </el-form-item>
                    <el-form-item label="千问建议">
                        <el-input v-model="edit_project.aiSuggestion" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="edit_project.createTime" />
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
    export default{
        data(){
            return{
                list:[],
                addDialogVisible:false,
                editDialogVisible:false,
                add_project:{
                        id:0,
                        projectId:1,
                        parentId:null,
                        title:'',
                        description:'',
                        assigneeId:2,
                        creatorId:2,
                        status:'',
                        priority:'',
                        dueDate:'',
                        aiSuggestion:'',
                        createTime:''
                    },
                edit_project:{
                        id:0,
                        projectId:1,
                        parentId:null,
                        title:'',
                        description:'',
                        assigneeId:2,
                        creatorId:2,
                        status:'',
                        priority:'',
                        dueDate:'',
                        aiSuggestion:'',
                        createTime:''
                    },
            }
        },
        created(){
        this.List()
        },
        methods:{
        List(){
            axios.get("http://localhost:9000/task/list")
            .then(data=>this.list=data.data)
            .catch(err=>console.log(err))
        },
        add(){
            axios.post("http://localhost:9000/task/add",this.add_project)
            .then(data=>{
                        this.addDialogVisible=false
                        alert(data.data.msg)
                        this.List()
                    })
            .catch(err=>console.log(err))
        },
        load(row){
            axios.get("http://localhost:9000/task/one/"+row.id)
            .then(data=>{
            this.edit_project=data.data
            this.editDialogVisible=true
            })
            .catch(err=>console.log(err))
        },
        update(){
            axios.put("http://localhost:9000/task/update",this.edit_project)
            .then(data=>{
                        this.editDialogVisible=false
                        alert(data.data.msg)
                        this.List()
                    })
            .catch(err=>console.log(err))
        },
        del(row){
            axios.delete("http://localhost:9000/task/delete/"+row.id)
            .then(data=>{
                        alert(data.data.msg)
                        this.List()
                    })
            .catch(err=>console.log(err))
        }
        }
    }
</script>