
<template>
    <div>
        <div>
            <el-card class="card" style="border-radius: 20px"shadow="hover">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>项目列表</span>
                <el-button v-if="isLeader" type="primary" @click="addDialogVisible = true">新建项目</el-button>
                </div>
                <hr >
                <el-row>
                    <el-table :data="list" border style="width:100%">
                        <el-table-column prop="id" label="项目Id" width="80" />
                        <el-table-column prop="name" label="项目名称" width="180" />
                        <el-table-column prop="description" label="项目说明" width="180" />
                        <el-table-column prop="status" label="状态" width="80" />
                        <el-table-column prop="priority" label="优先级" width="80" />
                        <el-table-column prop="ownerId" label="所有者Id" width="80" />
                        <el-table-column prop="startDate" label="开始日期" width="180" />
                        <el-table-column prop="endDate" label="结束日期" width="180" />
                        <el-table-column prop="createTime" label="创建时间" width="180" />
                        <el-table-column label="操作" width="180">
                            <template #default="{row}">
                                <el-button v-if="isLeader" type="primary" @click="load(row)">编辑</el-button>
                                <el-button v-if="isLeader" type="danger" @click="del(row)">删除</el-button>
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
                    <el-form-item label="所有者Id">
                        <el-input v-model="add_project.ownerId" />
                    </el-form-item>
                    <el-form-item label="开始日期">
                        <el-input v-model="add_project.startDate" />
                    </el-form-item>
                    <el-form-item label="结束日期">
                        <el-input v-model="add_project.endDate" />
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
                    <el-form-item label="所有者Id">
                        <el-input v-model="edit_project.ownerId" />
                    </el-form-item>
                    <el-form-item label="开始日期">
                        <el-input v-model="edit_project.startDate" />
                    </el-form-item>
                    <el-form-item label="结束日期">
                        <el-input v-model="edit_project.endDate" />
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
        computed: {
            isLeader() { return this.$store.getters.isLeader }
        },
        data(){
            return{
                list:[],
                addDialogVisible:false,
                editDialogVisible:false,
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
        this.List()
        },
        methods:{
        List(){
            axios.get("http://localhost:9000/project/list")
            .then(data=>this.list=data.data)
            .catch(err=>console.log(err))
        },
        add(){
            axios.post("http://localhost:9000/project/add",this.add_project)
            .then(data=>{
                        this.addDialogVisible=false
                        alert(data.data.msg)
                        this.List()
                    })
            .catch(err=>console.log(err))
        },
        load(row){
            axios.get("http://localhost:9000/project/one/"+row.id)
            .then(data=>{
            this.edit_project=data.data
            this.editDialogVisible=true
            })
            .catch(err=>console.log(err))
        },
        update(){
            axios.put("http://localhost:9000/project/update",this.edit_project)
            .then(data=>{
                        this.editDialogVisible=false
                        alert(data.data.msg)
                        this.List()
                    })
            .catch(err=>console.log(err))
        },
        del(row){
            axios.delete("http://localhost:9000/project/delete/"+row.id)
            .then(data=>{
                        alert(data.data.msg)
                        this.List()
                    })
            .catch(err=>console.log(err))
        }
        }
    }
</script>