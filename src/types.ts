// 核心数据类型定义 - 与 SwiftUI 版本保持兼容

export type SubTimer = {
  id: string;
  name: string;
  duration: number; // 秒
};

export type TimerTask = {
  id: string;
  title: string;
  subTimers: SubTimer[];
  createdAt: number;
};

// 生成唯一 ID
export function generateId(): string {
  return crypto.randomUUID();
}

// 计算任务总时长
export function calculateTotalDuration(subTimers: SubTimer[]): number {
  return subTimers.reduce((sum, st) => sum + st.duration, 0);
}

// 格式化时间 (秒 -> mm:ss)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 转义 HTML
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 状态文本映射
export const STATUS_TEXT: Record<string, string> = {
  idle: '准备就绪',
  running: '运行中',
  paused: '已暂停',
  completed: '已完成'
}
