/**
 * 阿里云千问 DashScope API 直连服务
 * 文档：https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api
 */
import axios from 'axios'

const DASHSCOPE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const API_KEY = process.env.VUE_APP_DASHSCOPE_API_KEY

const SYSTEM_PROMPT = `你是一个项目管理助手。请根据用户提供的项目信息，将该项目的目标拆解为可执行的小任务。

要求：
1. 任务数量：3-7个
2. 每个任务包含：标题(title)、描述(description)、优先级(priority: 高/中/低)、建议完成天数(suggestedDays: 数字)、推荐负责人序号(assigneeId: 数字)
3. 输出一个summary字段概括整体方案
4. 严格输出JSON格式，不要markdown，不要任何额外文字
5. 每个任务都必须填写assigneeId，不能为空`

export async function generateTaskPlan({ projectName, goal, description, members }) {
  const memberText = members.map(m => `${m.id} - ${m.realName || m.username}（${m.role}）`).join('\n')

  const userPrompt = `项目名称：${projectName}
任务目标：${goal}
补充说明：${description || '无'}
可选成员（id - 姓名 - 角色）：
${memberText}

请将该项目拆解为可执行的任务，返回JSON格式。`

  const response = await axios.post(
    DASHSCOPE_URL,
    {
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  )

  const content = response.data?.choices?.[0]?.message?.content || ''
  return parseAIResponse(content, members, goal)
}

function parseAIResponse(content, members, goal) {
  let jsonStr = content

  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  try {
    const parsed = JSON.parse(jsonStr)
    const items = (parsed.items || []).map(item => {
      let assigneeId = item.assigneeId
      const validIds = members.map(m => m.id)
      if (!validIds.includes(Number(assigneeId))) {
        assigneeId = members[0]?.id || 1
      }
      return {
        title: item.title || '未命名任务',
        description: item.description || '',
        priority: ['高', '中', '低'].includes(item.priority) ? item.priority : '中',
        suggestedDays: Number(item.suggestedDays) || 3,
        assigneeId: Number(assigneeId)
      }
    })
    return {
      summary: parsed.summary || `已为"${goal || '项目'}"拆解出 ${items.length} 个任务`,
      items
    }
  } catch (e) {
    console.warn('AI JSON 解析失败:', e, '\n原始内容:', content)
    return null
  }
}

export function buildFallbackPlan(goal, members) {
  const tasks = [
    { title: '需求分析与确认', description: '明确目标边界、成功标准和关键需求', priority: '高', suggestedDays: 2 },
    { title: '方案设计与评审', description: '制定详细实施方案，分配资源和排期', priority: '高', suggestedDays: 3 },
    { title: '执行与实施', description: '按方案逐步推进各项工作', priority: '中', suggestedDays: 5 },
    { title: '质量检查与验收', description: '对成果进行检查和验收', priority: '中', suggestedDays: 2 },
    { title: '项目总结与复盘', description: '整理文档，总结经验教训', priority: '低', suggestedDays: 1 }
  ]
  return {
    summary: `针对"${goal}"已生成标准拆解方案（共 ${tasks.length} 个阶段）。建议根据实际需求调整顺序和内容。`,
    items: tasks.map((t, i) => ({
      ...t,
      assigneeId: members[i % members.length]?.id || members[0]?.id || 1
    }))
  }
}
