<template>
  <div class="allcard">
    <!-- 1. 成员总数卡片 -->
    <el-card class="card" style="height: 120px; width: 288px; border-radius: 20px" shadow="hover">
      <div class="subtitle">成员总数</div>
      <div class="title">{{ stats.memberCount }}</div>
    </el-card>

    <!-- 2. 项目总数卡片 -->
    <el-card class="card" style="height: 120px; width: 288px; border-radius: 20px" shadow="hover">
      <div class="subtitle">项目总数</div>
      <div class="title">{{ stats.projectCount }}</div>
    </el-card>

    <!-- 3. 任务总数卡片 -->
    <el-card class="card" style="height: 120px; width: 288px; border-radius: 20px" shadow="never">
      <div class="subtitle">任务总数</div>
      <div class="title">{{ stats.taskCount }}</div>
    </el-card>

    <!-- 4. 总结总数卡片 -->
    <el-card class="card" style="height: 120px; width: 288px; border-radius: 20px" shadow="never">
      <div class="subtitle">总结总数</div>
      <div class="title">{{ stats.summaryCount }}</div>
    </el-card>

    <!-- 5. 最近项目表格 -->
    <el-card class="card" style="height: 320px; width: 596px; border-radius: 20px" shadow="never">
      <el-row>最近项目</el-row>
      <hr />
      <el-row>
        <el-table :data="recentProjects" border style="width: 100%">
          <el-table-column prop="name" label="项目名称" width="250" />
          <el-table-column prop="status" label="状态" width="180" />
          <el-table-column prop="priority" label="优先级" width="120" />
        </el-table>
      </el-row>
    </el-card>

    <!-- 6. 最近任务表格 -->
    <el-card class="card" style="height: 320px; width: 596px; border-radius: 20px" shadow="never">
      <el-row>最近任务</el-row>
      <hr />
      <el-row>
        <el-table :data="recentTasks" border style="width: 100%">
          <el-table-column prop="title" label="任务标题" width="250" />
          <el-table-column prop="status" label="状态" width="180" />
          <el-table-column prop="priority" label="优先级" width="120" />
        </el-table>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      // 统计数字对象
      stats: {
        memberCount: 0,
        projectCount: 0,
        taskCount: 0,
        summaryCount: 0
      },
      // 两个表格的数据列表
      recentProjects: [],
      recentTasks: []
    };
  },
  created() {
    this.getOverviewData();
  },
  methods: {
    // 获取概览整体数据
    getOverviewData() {
      axios.get("http://localhost:9000/overview/data")
        .then(res => {
          const vo = res.data;
          // 绑定 4 个统计数据
          this.stats.memberCount = vo.memberCount || 0;
          this.stats.projectCount = vo.projectCount || 0;
          this.stats.taskCount = vo.taskCount || 0;
          this.stats.summaryCount = vo.summaryCount || 0;

          // 绑定最近项目和最近任务列表
          this.recentProjects = vo.recentProjects || [];
          this.recentTasks = vo.recentTasks || [];
        })
        .catch(err => {
          console.error("获取概览数据失败：", err);
        });
    }
  }
};
</script>

<style scoped>
.allcard {
  height: 150px;
  margin-bottom: 0px;
  padding: 0px;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  flex: 1;
  margin: 10px;
  height: 100%;
  float: left;
}
.title {
  font-size: 24px;
  font-weight: bold;
  line-height: 2;
}
.subtitle {
  font-size: 14px;
  color: #666;
  line-height: 2;
}

</style>