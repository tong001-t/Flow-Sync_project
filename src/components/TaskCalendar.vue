<template>
  <div class="calendar-card">
    <el-calendar v-model="currentDate">
      <template #date-cell="{ data }">
        <div class="date-cell" :class="{ 'is-today': isToday(data.date) }">
          <div class="date-number">{{ data.day.split('-').pop() }}</div>
          <div class="task-list" v-if="getTasksForDate(data.date).length">
            <div
              v-for="task in getTasksForDate(data.date)"
              :key="task.id"
              class="task-pill"
              :class="priorityClass(task.priority)"
              :title="task.title"
            >
              <span class="task-title">{{ task.title }}</span>
            </div>
          </div>
          <div v-else class="empty-tip">无任务</div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const currentDate = ref(new Date())

const formatDateKey = (value) => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeTaskDate = (task) => {
  if (!task?.dueDate) return ''
  if (task.dueDate instanceof Date) return formatDateKey(task.dueDate)
  const value = String(task.dueDate)
  return value.length >= 10 ? value.slice(0, 10) : value
}

const getTasksForDate = (date) => {
  const key = formatDateKey(date)
  return (props.tasks || []).filter((task) => normalizeTaskDate(task) === key)
}

const isToday = (date) => {
  if (!date) return false
  const target = date instanceof Date ? date : new Date(date)
  const today = new Date()
  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  )
}

const priorityClass = (priority) => {
  const p = String(priority || '').trim()
  if (p === '高') return 'priority-high'
  if (p === '中') return 'priority-medium'
  if (p === '低') return 'priority-low'
  return 'priority-default'
}
</script>

<style scoped>
.calendar-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

:deep(.el-calendar-table .el-calendar-day) {
  height: 120px;
  padding: 6px;
  vertical-align: top;
}

:deep(.el-calendar__body) {
  padding: 8px 0 0;
}

.date-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  border-radius: 10px;
  padding: 6px;
  transition: all 0.2s ease;
}

.date-cell.is-today {
  background: linear-gradient(135deg, #e8f4ff, #f0f9ff);
  border: 1px solid #79bbff;
  box-shadow: inset 0 0 0 1px rgba(64, 158, 255, 0.12);
}

.date-number {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.date-cell.is-today .date-number {
  color: #409eff;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  padding-right: 2px;
}

.task-pill {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-high {
  background: linear-gradient(90deg, #f56c6c, #e74c3c);
}

.priority-medium {
  background: linear-gradient(90deg, #e6a23c, #f59e0b);
}

.priority-low {
  background: linear-gradient(90deg, #67c23a, #4caf50);
}

.priority-default {
  background: linear-gradient(90deg, #909399, #6b7280);
}

.empty-tip {
  font-size: 12px;
  color: #909399;
}
</style>
