import type { TimerTask } from './types';

const STORAGE_KEY = 'mst-tasks';

// 从 localStorage 加载任务
export function loadTasks(): TimerTask[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存任务到 localStorage
export function saveTasks(tasks: TimerTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
