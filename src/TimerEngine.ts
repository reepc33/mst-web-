import type { TimerTask, SubTimer } from './types';

// 运行状态
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

// 计时器引擎 - 核心逻辑与 SwiftUI 版本保持一致
export class TimerEngine {
  private task: TimerTask | null = null;
  private currentIndex: number = 0;
  private remainingTime: number = 0;
  private status: TimerStatus = 'idle';
  private intervalId: number | null = null;
  private onTick: (() => void) | null = null;
  private onComplete: (() => void) | null = null;
  private onSubTimerChange: ((subTimer: SubTimer, index: number) => void) | null = null;
  private onUpdate: ((remainingTime: number, currentProgress: number, overallProgress: number) => void) | null = null;

  // 设置回调 - onUpdate 用于增量更新 UI，避免全量重渲染
  setCallbacks(
    onTick: () => void,
    onComplete: () => void,
    onSubTimerChange: (subTimer: SubTimer, index: number) => void,
    onUpdate?: (remainingTime: number, currentProgress: number, overallProgress: number) => void
  ): void {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.onSubTimerChange = onSubTimerChange;
    this.onUpdate = onUpdate || null;
  }

  // 加载任务
  loadTask(task: TimerTask): void {
    this.stop();
    this.task = task;
    this.currentIndex = 0;
    this.remainingTime = task.subTimers[0]?.duration || 0;
    this.status = 'idle';
  }

  // 获取当前子任务
  getCurrentSubTimer(): SubTimer | null {
    return this.task?.subTimers[this.currentIndex] || null;
  }

  // 获取下一个子任务
  getNextSubTimer(): SubTimer | null {
    return this.task?.subTimers[this.currentIndex + 1] || null;
  }

  // 获取当前索引
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  // 获取剩余时间
  getRemainingTime(): number {
    return this.remainingTime;
  }

  // 获取状态
  getStatus(): TimerStatus {
    return this.status;
  }

  // 获取任务
  getTask(): TimerTask | null {
    return this.task;
  }

  // 获取已完成的子任务数量
  getCompletedCount(): number {
    return this.currentIndex;
  }

  // 获取总子任务数量
  getTotalCount(): number {
    return this.task?.subTimers.length || 0;
  }

  // 开始
  start(): void {
    if (!this.task || this.task.subTimers.length === 0) return;

    if (this.status === 'idle' || this.status === 'completed') {
      this.currentIndex = 0;
      this.remainingTime = this.task.subTimers[0].duration;
    }

    this.status = 'running';
    this.startInterval();
  }

  // 暂停
  pause(): void {
    this.status = 'paused';
    this.stopInterval();
  }

  // 恢复
  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running';
      this.startInterval();
    }
  }

  // 停止
  stop(): void {
    this.status = 'idle';
    this.stopInterval();
    if (this.task) {
      this.currentIndex = 0;
      this.remainingTime = this.task.subTimers[0]?.duration || 0;
    }
  }

  // 跳到下一个子任务
  skipToNext(): void {
    if (!this.task) return;

    if (this.currentIndex < this.task.subTimers.length - 1) {
      this.currentIndex++;
      this.remainingTime = this.task.subTimers[this.currentIndex].duration;
      this.onSubTimerChange?.(this.task.subTimers[this.currentIndex], this.currentIndex);
      this.onTick?.();
    } else {
      this.complete();
    }
  }

  // 完成
  private complete(): void {
    this.status = 'completed';
    this.stopInterval();
    this.onComplete?.();
  }

  private startInterval(): void {
    this.stopInterval();
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    if (this.remainingTime > 0) {
      this.remainingTime--;
      // 使用增量更新回调，避免全量重渲染
      this.onUpdate?.(
        this.remainingTime,
        this.calculateCurrentProgress(),
        this.calculateOverallProgress()
      );
    } else {
      // 当前子任务结束，自动跳到下一个
      if (this.task && this.currentIndex < this.task.subTimers.length - 1) {
        this.currentIndex++;
        this.remainingTime = this.task.subTimers[this.currentIndex].duration;
        this.onSubTimerChange?.(this.task.subTimers[this.currentIndex], this.currentIndex);
      } else {
        this.complete();
      }
    }
  }

  // 计算当前子任务进度
  private calculateCurrentProgress(): number {
    const currentSt = this.getCurrentSubTimer()
    if (!currentSt) return 0
    return ((currentSt.duration - this.remainingTime) / currentSt.duration) * 100
  }

  // 计算总体进度
  private calculateOverallProgress(): number {
    if (!this.task) return 0
    const totalDuration = this.task.subTimers.reduce((sum, st) => sum + st.duration, 0)
    if (totalDuration === 0) return 0

    let elapsed = 0
    for (let i = 0; i < this.currentIndex; i++) {
      elapsed += this.task.subTimers[i].duration
    }
    elapsed += this.getCurrentSubTimer()!.duration - this.remainingTime

    return (elapsed / totalDuration) * 100
  }
}
