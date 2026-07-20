<template>
    <el-card class="card" style="width: 1222px ;border-radius: 20px"shadow="hover">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>AI任务拆解</span>
        </div>
        <hr >
        <el-form :model="form" label-width="auto" style="max-width: 100%">
            <el-form-item label="所属项目">
                <el-input  v-model="project_name" placeholder="请输入所属项目名称"/>
            </el-form-item>
            <el-form-item label="任务目标"placeholder="例如：完成迎新活动准备工作">
                <el-input  v-model="porject_option" placeholder="例如：完成迎新活动准备工作"/>
            </el-form-item>
            <el-form-item label="补充说明" prop="desc">
                <el-input  v-model="state" :rows="4" type="textarea"placeholder="可以补充时间要求、执行范围、注意事项"default="height:50px" />
            </el-form-item>
        </el-form>
        <el-button type="primary" style="display: flex; justify-content: flex-start;">
        生成拆解结果
        </el-button>
    </el-card>
</template>
<script setup>

</script>
<script setup>
import { ref } from 'vue'
const project_name = ref('')
const porject_option = ref('')
const state = ref('')
</script>