<template>
  <div class="allcard">
            <el-card class="card" style="height: 120px;width: 288px ;border-radius: 20px"shadow="hover">
                <div class="subtitle">成员总数</div>
                <div class="title">5</div>
            </el-card>
            <el-card class="card"style="height: 120px;width: 288px ;border-radius: 20px" shadow="hover">
                <div class="subtitle">项目总数</div>
                <div class="title">1</div>
            </el-card>
            <el-card class="card"style="height: 120px;width: 288px ;border-radius: 20px" shadow="never">
                <div class="subtitle">任务总数</div>
                <div class="title">？</div>
            </el-card>
            <el-card class="card"style="height: 120px;width: 288px ;border-radius: 20px" shadow="never">
                <div class="subtitle">总结总数</div>
                <div class="title">0</div>
            </el-card>
            <el-card class="card"style="height: 300px;width: 596px ;border-radius: 20px" shadow="never">
                <el-row>
                    最近项目
                </el-row>
                <hr >
                <el-row>
                    <el-table :data="tableData" border style="width: 100%">
                        <el-table-column prop="date" label="项目名称" width="250" />
                        <el-table-column prop="name" label="状态" width="180" />
                        <el-table-column prop="address" label="优先级" width="120" />
                    </el-table>
                </el-row>
            </el-card>
            <el-card class="card"style="height: 300px;width: 596px ;border-radius: 20px"s shadow="never">
                <el-row>
                    最近任务
                </el-row>
                <hr >
                <el-row>
                    <el-table :data="tableData2" border style="width: 100%">
                        <el-table-column prop="date" label="任务标题" width="250" />
                        <el-table-column prop="name" label="状态" width="180" />
                        <el-table-column prop="address" label="优先级" width="120" />
                    </el-table>
                </el-row>
            </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCssVar } from '@vueuse/core'

'use strict'
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'Angeles',
  },
]
const tableData2 = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'Angeles',
  },
]
</script>

<style scoped>
.allcard{
    height:150px;
     margin-bottom:0px;
     flex:left;
     padding:px
}
.card {
  /* flex: 1;               核心：等同于 main 的效果，自动吃掉右边所有剩下的宽度
  height: 100%;
  padding: 0 24px;       右侧内部的边距
  display: flex;
  align-items: center;   让右边的内容（比如文字或菜单）垂直居中
  gap: 4px;  */
  display: flex;
  flex-direction: column; /* 让文字上下排列 */
  gap: 8px;              /* 精准控制两个文本之间的间距，数字越小越紧凑 */
  align-items: flex-start; /* 左对齐 */
  flex: 1;
  margin: 10px;
  height:100%;
  float:left;
}
.title {
  font-size: 24px;
  font-weight: bold;
  line-height: 2;       /* 压低大文字自身的行高 */
}
.subtitle {
  font-size: 14px;
  color: #666;
  line-height: 2;
}
</style>