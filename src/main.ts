import './style.css'
import type { TimerTask, SubTimer } from './types'
import { generateId, calculateTotalDuration, formatTime, escapeHtml, STATUS_TEXT } from './types'
import { TimerEngine } from './TimerEngine'
import type { TimerStatus } from './TimerEngine'
import { loadTasks, saveTasks } from './storage'

// 创建任务列表 UI
function createTaskList(tasks: TimerTask[]): string {
  if (tasks.length === 0) {
    return `<div class="text-gray-400 text-center py-8">暂无任务，点击上方创建</div>`
  }

  return tasks.map(task => {
    const total = calculateTotalDuration(task.subTimers)
    return `
      <div class="task-item flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer transition-colors" data-id="${task.id}">
        <div class="flex-1">
          <div class="font-medium text-gray-800">${escapeHtml(task.title)}</div>
          <div class="text-sm text-gray-500">${task.subTimers.length} 个子任务 · ${formatTime(total)}</div>
        </div>
        <button class="delete-btn text-gray-400 hover:text-red-500 p-1" data-id="${task.id}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `
  }).join('')
}


// 创建子任务列表编辑 UI
function createSubTimerEditor(subTimers: SubTimer[]): string {
  if (subTimers.length === 0) {
    return `<div class="text-gray-400 text-sm py-2">暂无子任务</div>`
  }

  return subTimers.map((st, index) => {
    const minutes = Math.floor(st.duration / 60)
    const seconds = st.duration % 60
    return `
    <div class="subtimer-item flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded" draggable="true" data-index="${index}">
      <span class="text-gray-400 cursor-move">☰</span>
      <input type="text" value="${escapeHtml(st.name)}" class="st-name flex-1 px-2 py-1 border rounded text-sm" placeholder="子任务名称">
      <input type="number" value="${minutes}" min="0" class="st-minutes w-14 px-2 py-1 border rounded text-sm text-center" placeholder="分">
      <span class="text-gray-500 text-sm">分</span>
      <input type="number" value="${seconds}" min="0" max="59" class="st-seconds w-14 px-2 py-1 border rounded text-sm text-center" placeholder="秒">
      <span class="text-gray-500 text-sm">秒</span>
      <button class="remove-st text-gray-400 hover:text-red-500" data-index="${index}">×</button>
    </div>
  `}).join('')
}

// 创建运行中的计时器 UI
function createTimerDisplay(engine: TimerEngine): string {
  const task = engine.getTask()
  const currentSt = engine.getCurrentSubTimer()
  const status = engine.getStatus()

  if (!task || !currentSt) {
    return `<div class="text-gray-400">请选择一个任务</div>`
  }

  const totalDuration = calculateTotalDuration(task.subTimers)
  const completedCount = engine.getCompletedCount()
  const totalCount = engine.getTotalCount()

  // 计算总体进度
  let elapsedInCurrent = currentSt.duration - engine.getRemainingTime()
  for (let i = 0; i < completedCount; i++) {
    elapsedInCurrent += task.subTimers[i].duration
  }
  const overallProgress = (elapsedInCurrent / totalDuration) * 100

  // 当前任务进度
  const currentProgress = ((currentSt.duration - engine.getRemainingTime()) / currentSt.duration) * 100

  // 状态颜色映射
  const statusColor: Record<TimerStatus, string> = {
    idle: 'text-gray-600',
    running: 'text-green-600',
    paused: 'text-yellow-600',
    completed: 'text-blue-600'
  }

  return `
    <div class="timer-display">
      <div class="text-center mb-4">
        <h2 class="text-xl font-medium text-gray-800">${escapeHtml(task.title)}</h2>
        <div class="text-sm text-gray-500 mt-1">
          ${completedCount + 1} / ${totalCount} · ${STATUS_TEXT[status]}
        </div>
      </div>

      <div class="text-center mb-6">
        <div id="timer-time" class="text-6xl font-mono font-bold ${statusColor[status]} mb-2">
          ${formatTime(engine.getRemainingTime())}
        </div>
        <div class="text-lg text-gray-600">${escapeHtml(currentSt.name)}</div>
      </div>

      <!-- 当前子任务进度条 -->
      <div class="mb-4">
        <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div id="current-progress-bar" class="h-full bg-blue-500 transition-all duration-1000" style="width: ${currentProgress}%"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>${currentSt.duration}秒</span>
          <span id="remaining-text">剩余 ${engine.getRemainingTime()}秒</span>
        </div>
      </div>

      <!-- 总体进度条 -->
      <div class="mb-6">
        <div class="text-xs text-gray-500 mb-1">总体进度</div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div id="overall-progress-bar" class="h-full bg-green-500 transition-all duration-1000" style="width: ${overallProgress}%"></div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="flex justify-center gap-3">
        ${status === 'idle' || status === 'completed' ? `
          <button id="btn-start" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            开始
          </button>
        ` : ''}
        ${status === 'running' ? `
          <button id="btn-pause" class="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
            暂停
          </button>
        ` : ''}
        ${status === 'paused' ? `
          <button id="btn-resume" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            继续
          </button>
        ` : ''}
        ${status !== 'idle' ? `
          <button id="btn-stop" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            停止
          </button>
        ` : ''}
        ${status === 'running' || status === 'paused' ? `
          <button id="btn-skip" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            跳过
          </button>
        ` : ''}
      </div>
    </div>
  `
}

// 主应用类
class App {
  private tasks: TimerTask[] = []
  private currentTask: TimerTask | null = null
  private engine: TimerEngine
  private mode: 'list' | 'edit' | 'run' = 'list'

  constructor() {
    this.tasks = loadTasks()
    this.engine = new TimerEngine()
    this.engine.setCallbacks(
      () => this.render(),           // onTick - 全量重渲染
      () => this.onTimerComplete(),  // onComplete
      () => this.render(),           // onSubTimerChange
      (remainingTime, currentProgress, overallProgress) => this.updateTimerDisplay(remainingTime, currentProgress, overallProgress) // onUpdate - 增量更新
    )
    this.render()
  }

  // 增量更新计时器显示，避免全量重渲染
  private updateTimerDisplay(remainingTime: number, currentProgress: number, overallProgress: number): void {
    const timeDisplay = document.getElementById('timer-time')
    const currentBar = document.getElementById('current-progress-bar')
    const overallBar = document.getElementById('overall-progress-bar')
    const remainingText = document.getElementById('remaining-text')

    if (timeDisplay) {
      timeDisplay.textContent = formatTime(remainingTime)
    }
    if (currentBar) {
      (currentBar as HTMLElement).style.width = `${currentProgress}%`
    }
    if (overallBar) {
      (overallBar as HTMLElement).style.width = `${overallProgress}%`
    }
    if (remainingText) {
      remainingText.textContent = `剩余 ${remainingTime}秒`
    }
  }

  private onTimerComplete(): void {
    // 播放提示音
    this.playAlert()

    // 显示自定义提示框，1秒后自动关闭
    this.showAutoCloseModal('任务完成！')
  }

  // 显示自动关闭的提示框
  private showAutoCloseModal(message: string): void {
    const app = document.getElementById('app')!
    const modal = document.createElement('div')
    modal.id = 'completion-modal'
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 text-center shadow-lg">
          <div class="text-2xl font-semibold text-gray-800 mb-2">${message}</div>
          <div class="text-gray-500 text-sm">🎉</div>
        </div>
      </div>
    `
    app.appendChild(modal)

    // 1秒后自动关闭
    setTimeout(() => {
      modal.remove()
      this.engine.stop()
      this.mode = 'list'
      this.render()
    }, 1000)
  }

  private playAlert(): void {
    try {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3

      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        audioContext.close()
      }, 1000)
    } catch {
      console.log('Audio not supported')
    }
  }

  private render(): void {
    const app = document.getElementById('app')!

    if (this.mode === 'list') {
      app.innerHTML = this.createListView()
      this.bindListEvents()
    } else if (this.mode === 'edit') {
      app.innerHTML = this.createEditView()
      this.bindEditEvents()
    } else if (this.mode === 'run') {
      app.innerHTML = this.createRunView()
      this.bindRunEvents()
    }
  }

  private createListView(): string {
    return `
      <div class="min-h-screen bg-gray-50">
        <header class="bg-white border-b px-4 py-4">
          <div class="max-w-2xl mx-auto flex justify-between items-center">
            <h1 class="text-xl font-semibold text-gray-800">序列计时器</h1>
            <button id="btn-create" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              + 新建任务
            </button>
          </div>
        </header>

        <main class="max-w-2xl mx-auto p-4">
          <div class="space-y-2">
            ${createTaskList(this.tasks)}
          </div>
        </main>
      </div>
    `
  }

  private createEditView(): string {
    const task = this.currentTask!
    return `
      <div class="min-h-screen bg-gray-50">
        <header class="bg-white border-b px-4 py-4">
          <div class="max-w-2xl mx-auto flex justify-between items-center">
            <button id="btn-back" class="text-gray-600 hover:text-gray-800">
              ← 返回
            </button>
            <h1 class="text-xl font-semibold text-gray-800">编辑任务</h1>
            <button id="btn-save" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              保存
            </button>
          </div>
        </header>

        <main class="max-w-2xl mx-auto p-4">
          <div class="bg-white rounded-lg p-4 mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
            <input type="text" id="task-title" value="${escapeHtml(task.title)}"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：晨间routine">
          </div>

          <div class="bg-white rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <label class="block text-sm font-medium text-gray-700">子任务列表</label>
              <button id="btn-add-st" class="text-sm text-blue-500 hover:text-blue-600">
                + 添加子任务
              </button>
            </div>

            <div id="subtimer-list">
              ${createSubTimerEditor(task.subTimers)}
            </div>

            <div class="mt-4 pt-3 border-t text-sm text-gray-500">
              总时长: ${formatTime(calculateTotalDuration(task.subTimers))}
            </div>
          </div>
        </main>
      </div>
    `
  }

  private createRunView(): string {
    return `
      <div class="min-h-screen bg-gray-50">
        <header class="bg-white border-b px-4 py-4">
          <div class="max-w-2xl mx-auto flex justify-between items-center">
            <button id="btn-back" class="text-gray-600 hover:text-gray-800">
              ← 返回
            </button>
            <h1 class="text-xl font-semibold text-gray-800">运行中</h1>
            <div class="w-16"></div>
          </div>
        </header>

        <main class="max-w-2xl mx-auto p-4">
          <div class="bg-white rounded-lg p-6">
            ${createTimerDisplay(this.engine)}
          </div>
        </main>
      </div>
    `
  }

  private bindListEvents(): void {
    const app = document.getElementById('app')!

    // 新建任务
    app.querySelector('#btn-create')?.addEventListener('click', () => {
      this.currentTask = {
        id: generateId(),
        title: '',
        subTimers: [],
        createdAt: Date.now()
      }
      this.mode = 'edit'
      this.render()
    })

    // 选择任务
    app.querySelectorAll('.task-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        if (target.closest('.delete-btn')) return

        const id = (item as HTMLElement).dataset.id!
        const task = this.tasks.find(t => t.id === id)
        if (task) {
          this.currentTask = task
          this.engine.loadTask(task)
          this.mode = 'run'
          this.render()
        }
      })
    })

    // 删除任务
    app.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = (btn as HTMLElement).dataset.id!
        if (confirm('确定删除这个任务吗？')) {
          this.tasks = this.tasks.filter(t => t.id !== id)
          saveTasks(this.tasks)
          this.render()
        }
      })
    })
  }

  private bindEditEvents(): void {
    const app = document.getElementById('app')!

    // 返回
    app.querySelector('#btn-back')?.addEventListener('click', () => {
      this.mode = 'list'
      this.render()
    })

    // 保存
    app.querySelector('#btn-save')?.addEventListener('click', () => {
      const titleInput = app.querySelector('#task-title') as HTMLInputElement
      const title = titleInput.value.trim()

      if (!title) {
        alert('请输入任务名称')
        return
      }

      // 收集子任务
      const subTimerItems = app.querySelectorAll('.subtimer-item')
      const subTimers: SubTimer[] = []

      subTimerItems.forEach((item, index) => {
        const nameInput = item.querySelector('.st-name') as HTMLInputElement
        const minutesInput = item.querySelector('.st-minutes') as HTMLInputElement
        const secondsInput = item.querySelector('.st-seconds') as HTMLInputElement

        const name = nameInput.value.trim() || `子任务 ${index + 1}`
        const minutes = parseInt(minutesInput.value) || 0
        const seconds = parseInt(secondsInput.value) || 0
        const duration = minutes * 60 + seconds

        subTimers.push({
          id: this.currentTask!.subTimers[index]?.id || generateId(),
          name,
          duration: duration > 0 ? duration : 60 // 最小60秒
        })
      })

      if (subTimers.length === 0) {
        alert('请添加至少一个子任务')
        return
      }

      this.currentTask!.title = title
      this.currentTask!.subTimers = subTimers

      // 检查是新建还是更新
      const existingIndex = this.tasks.findIndex(t => t.id === this.currentTask!.id)
      if (existingIndex >= 0) {
        this.tasks[existingIndex] = this.currentTask!
      } else {
        this.tasks.push(this.currentTask!)
      }

      saveTasks(this.tasks)
      this.mode = 'list'
      this.render()
    })

    // 添加子任务 - 先保存当前输入再添加
    app.querySelector('#btn-add-st')?.addEventListener('click', () => {
      // 先保存当前输入
      this.saveCurrentSubTimersFromDom()

      // 添加新子任务
      this.currentTask!.subTimers.push({
        id: generateId(),
        name: '',
        duration: 60
      })
      const list = app.querySelector('#subtimer-list')!
      list.innerHTML = createSubTimerEditor(this.currentTask!.subTimers)
      this.bindSubTimerEvents()
    })

    this.bindSubTimerEvents()
  }

  private bindSubTimerEvents(): void {
    const app = document.getElementById('app')!

    // 删除子任务 - 先保存当前输入再删除
    app.querySelectorAll('.remove-st').forEach(btn => {
      btn.addEventListener('click', () => {
        // 先读取并保存当前输入
        this.saveCurrentSubTimersFromDom()

        const index = parseInt((btn as HTMLElement).dataset.index!)
        this.currentTask!.subTimers.splice(index, 1)
        const list = app.querySelector('#subtimer-list')!
        list.innerHTML = createSubTimerEditor(this.currentTask!.subTimers)
        this.bindSubTimerEvents()
      })
    })
  }

  // 从 DOM 读取并保存当前子任务数据
  private saveCurrentSubTimersFromDom(): void {
    const app = document.getElementById('app')!
    const subTimerItems = app.querySelectorAll('.subtimer-item')
    subTimerItems.forEach((item, index) => {
      const nameInput = item.querySelector('.st-name') as HTMLInputElement
      const minutesInput = item.querySelector('.st-minutes') as HTMLInputElement
      const secondsInput = item.querySelector('.st-seconds') as HTMLInputElement

      const name = nameInput.value.trim() || `子任务 ${index + 1}`
      const minutes = parseInt(minutesInput.value) || 0
      const seconds = parseInt(secondsInput.value) || 0
      const duration = minutes * 60 + seconds

      if (this.currentTask!.subTimers[index]) {
        this.currentTask!.subTimers[index].name = name
        this.currentTask!.subTimers[index].duration = duration > 0 ? duration : 60
      }
    })
  }

  private bindRunEvents(): void {
    const app = document.getElementById('app')!

    // 返回
    app.querySelector('#btn-back')?.addEventListener('click', () => {
      this.engine.stop()
      this.mode = 'list'
      this.render()
    })

    // 开始
    app.querySelector('#btn-start')?.addEventListener('click', () => {
      this.engine.start()
      this.render()
    })

    // 暂停
    app.querySelector('#btn-pause')?.addEventListener('click', () => {
      this.engine.pause()
      this.render()
    })

    // 继续
    app.querySelector('#btn-resume')?.addEventListener('click', () => {
      this.engine.resume()
      this.render()
    })

    // 停止
    app.querySelector('#btn-stop')?.addEventListener('click', () => {
      this.engine.stop()
      this.render()
    })

    // 跳过
    app.querySelector('#btn-skip')?.addEventListener('click', () => {
      this.engine.skipToNext()
      this.render()
    })
  }
}

// 启动应用
new App()
