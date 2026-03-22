var $=Object.defineProperty;var L=(r,t,e)=>t in r?$(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var l=(r,t,e)=>L(r,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();function p(){return crypto.randomUUID()}function v(r){return r.reduce((t,e)=>t+e.duration,0)}function b(r){const t=Math.floor(r/60),e=r%60;return`${t.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}`}function h(r){const t=document.createElement("div");return t.textContent=r,t.innerHTML}const q={idle:"准备就绪",running:"运行中",paused:"已暂停",completed:"已完成"};class A{constructor(){l(this,"task",null);l(this,"currentIndex",0);l(this,"remainingTime",0);l(this,"status","idle");l(this,"intervalId",null);l(this,"onTick",null);l(this,"onComplete",null);l(this,"onSubTimerChange",null);l(this,"onUpdate",null)}setCallbacks(t,e,s,i){this.onTick=t,this.onComplete=e,this.onSubTimerChange=s,this.onUpdate=i||null}loadTask(t){var e;this.stop(),this.task=t,this.currentIndex=0,this.remainingTime=((e=t.subTimers[0])==null?void 0:e.duration)||0,this.status="idle"}getCurrentSubTimer(){var t;return((t=this.task)==null?void 0:t.subTimers[this.currentIndex])||null}getNextSubTimer(){var t;return((t=this.task)==null?void 0:t.subTimers[this.currentIndex+1])||null}getCurrentIndex(){return this.currentIndex}getRemainingTime(){return this.remainingTime}getStatus(){return this.status}getTask(){return this.task}getCompletedCount(){return this.currentIndex}getTotalCount(){var t;return((t=this.task)==null?void 0:t.subTimers.length)||0}start(){!this.task||this.task.subTimers.length===0||((this.status==="idle"||this.status==="completed")&&(this.currentIndex=0,this.remainingTime=this.task.subTimers[0].duration),this.status="running",this.startInterval())}pause(){this.status="paused",this.stopInterval()}resume(){this.status==="paused"&&(this.status="running",this.startInterval())}stop(){var t;this.status="idle",this.stopInterval(),this.task&&(this.currentIndex=0,this.remainingTime=((t=this.task.subTimers[0])==null?void 0:t.duration)||0)}skipToNext(){var t,e;this.task&&(this.currentIndex<this.task.subTimers.length-1?(this.currentIndex++,this.remainingTime=this.task.subTimers[this.currentIndex].duration,(t=this.onSubTimerChange)==null||t.call(this,this.task.subTimers[this.currentIndex],this.currentIndex),(e=this.onTick)==null||e.call(this)):this.complete())}complete(){var t;this.status="completed",this.stopInterval(),(t=this.onComplete)==null||t.call(this)}startInterval(){this.stopInterval(),this.intervalId=window.setInterval(()=>{this.tick()},1e3)}stopInterval(){this.intervalId!==null&&(clearInterval(this.intervalId),this.intervalId=null)}tick(){var t,e;this.remainingTime>0?(this.remainingTime--,(t=this.onUpdate)==null||t.call(this,this.remainingTime,this.calculateCurrentProgress(),this.calculateOverallProgress())):this.task&&this.currentIndex<this.task.subTimers.length-1?(this.currentIndex++,this.remainingTime=this.task.subTimers[this.currentIndex].duration,(e=this.onSubTimerChange)==null||e.call(this,this.task.subTimers[this.currentIndex],this.currentIndex)):this.complete()}calculateCurrentProgress(){const t=this.getCurrentSubTimer();return t?(t.duration-this.remainingTime)/t.duration*100:0}calculateOverallProgress(){if(!this.task)return 0;const t=this.task.subTimers.reduce((s,i)=>s+i.duration,0);if(t===0)return 0;let e=0;for(let s=0;s<this.currentIndex;s++)e+=this.task.subTimers[s].duration;return e+=this.getCurrentSubTimer().duration-this.remainingTime,e/t*100}}const T="mst-tasks";function B(){try{const r=localStorage.getItem(T);return r?JSON.parse(r):[]}catch{return[]}}function f(r){localStorage.setItem(T,JSON.stringify(r))}function M(r){return r.length===0?'<div class="text-gray-400 text-center py-8">暂无任务，点击上方创建</div>':r.map(t=>{const e=v(t.subTimers);return`
      <div class="task-item flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer transition-colors" data-id="${t.id}">
        <div class="flex-1">
          <div class="font-medium text-gray-800">${h(t.title)}</div>
          <div class="text-sm text-gray-500">${t.subTimers.length} 个子任务 · ${b(e)}</div>
        </div>
        <button class="delete-btn text-gray-400 hover:text-red-500 p-1" data-id="${t.id}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `}).join("")}function g(r){return r.length===0?'<div class="text-gray-400 text-sm py-2">暂无子任务</div>':r.map((t,e)=>{const s=Math.floor(t.duration/60),i=t.duration%60;return`
    <div class="subtimer-item flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded" draggable="true" data-index="${e}">
      <span class="text-gray-400 cursor-move">☰</span>
      <input type="text" value="${h(t.name)}" class="st-name flex-1 px-2 py-1 border rounded text-sm" placeholder="子任务名称">
      <input type="number" value="${s}" min="0" class="st-minutes w-14 px-2 py-1 border rounded text-sm text-center" placeholder="分">
      <span class="text-gray-500 text-sm">分</span>
      <input type="number" value="${i}" min="0" max="59" class="st-seconds w-14 px-2 py-1 border rounded text-sm text-center" placeholder="秒">
      <span class="text-gray-500 text-sm">秒</span>
      <button class="remove-st text-gray-400 hover:text-red-500" data-index="${e}">×</button>
    </div>
  `}).join("")}function D(r){const t=r.getTask(),e=r.getCurrentSubTimer(),s=r.getStatus();if(!t||!e)return'<div class="text-gray-400">请选择一个任务</div>';const i=v(t.subTimers),n=r.getCompletedCount(),a=r.getTotalCount();let o=e.duration-r.getRemainingTime();for(let c=0;c<n;c++)o+=t.subTimers[c].duration;const u=o/i*100,m=(e.duration-r.getRemainingTime())/e.duration*100,d={idle:"text-gray-600",running:"text-green-600",paused:"text-yellow-600",completed:"text-blue-600"};return`
    <div class="timer-display">
      <div class="text-center mb-4">
        <h2 class="text-xl font-medium text-gray-800">${h(t.title)}</h2>
        <div class="text-sm text-gray-500 mt-1">
          ${n+1} / ${a} · ${q[s]}
        </div>
      </div>

      <div class="text-center mb-6">
        <div id="timer-time" class="text-6xl font-mono font-bold ${d[s]} mb-2">
          ${b(r.getRemainingTime())}
        </div>
        <div class="text-lg text-gray-600">${h(e.name)}</div>
      </div>

      <!-- 当前子任务进度条 -->
      <div class="mb-4">
        <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div id="current-progress-bar" class="h-full bg-blue-500 transition-all duration-1000" style="width: ${m}%"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>${e.duration}秒</span>
          <span id="remaining-text">剩余 ${r.getRemainingTime()}秒</span>
        </div>
      </div>

      <!-- 总体进度条 -->
      <div class="mb-6">
        <div class="text-xs text-gray-500 mb-1">总体进度</div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div id="overall-progress-bar" class="h-full bg-green-500 transition-all duration-1000" style="width: ${u}%"></div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="flex justify-center gap-3">
        ${s==="idle"||s==="completed"?`
          <button id="btn-start" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            开始
          </button>
        `:""}
        ${s==="running"?`
          <button id="btn-pause" class="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
            暂停
          </button>
        `:""}
        ${s==="paused"?`
          <button id="btn-resume" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            继续
          </button>
        `:""}
        ${s!=="idle"?`
          <button id="btn-stop" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            停止
          </button>
        `:""}
        ${s==="running"||s==="paused"?`
          <button id="btn-skip" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            跳过
          </button>
        `:""}
      </div>
    </div>
  `}class O{constructor(){l(this,"tasks",[]);l(this,"currentTask",null);l(this,"engine");l(this,"mode","list");this.tasks=B(),this.engine=new A,this.engine.setCallbacks(()=>this.render(),()=>this.onTimerComplete(),()=>this.render(),(t,e,s)=>this.updateTimerDisplay(t,e,s)),this.render()}updateTimerDisplay(t,e,s){const i=document.getElementById("timer-time"),n=document.getElementById("current-progress-bar"),a=document.getElementById("overall-progress-bar"),o=document.getElementById("remaining-text");i&&(i.textContent=b(t)),n&&(n.style.width=`${e}%`),a&&(a.style.width=`${s}%`),o&&(o.textContent=`剩余 ${t}秒`)}onTimerComplete(){this.playAlert(),this.showAutoCloseModal("任务完成！")}showAutoCloseModal(t){const e=document.getElementById("app"),s=document.createElement("div");s.id="completion-modal",s.innerHTML=`
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 text-center shadow-lg">
          <div class="text-2xl font-semibold text-gray-800 mb-2">${t}</div>
          <div class="text-gray-500 text-sm">🎉</div>
        </div>
      </div>
    `,e.appendChild(s),setTimeout(()=>{s.remove(),this.engine.stop(),this.mode="list",this.render()},1e3)}playAlert(){try{const t=new AudioContext,e=t.createOscillator(),s=t.createGain();e.connect(s),s.connect(t.destination),e.frequency.value=800,e.type="sine",s.gain.value=.3,e.start(),setTimeout(()=>{e.stop(),t.close()},1e3)}catch{console.log("Audio not supported")}}render(){const t=document.getElementById("app");this.mode==="list"?(t.innerHTML=this.createListView(),this.bindListEvents()):this.mode==="edit"?(t.innerHTML=this.createEditView(),this.bindEditEvents()):this.mode==="run"&&(t.innerHTML=this.createRunView(),this.bindRunEvents())}createListView(){return`
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
            ${M(this.tasks)}
          </div>
        </main>
      </div>
    `}createEditView(){const t=this.currentTask;return`
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
            <input type="text" id="task-title" value="${h(t.title)}"
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
              ${g(t.subTimers)}
            </div>

            <div class="mt-4 pt-3 border-t text-sm text-gray-500">
              总时长: ${b(v(t.subTimers))}
            </div>
          </div>
        </main>
      </div>
    `}createRunView(){return`
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
            ${D(this.engine)}
          </div>
        </main>
      </div>
    `}bindListEvents(){var e;const t=document.getElementById("app");(e=t.querySelector("#btn-create"))==null||e.addEventListener("click",()=>{this.currentTask={id:p(),title:"",subTimers:[],createdAt:Date.now()},this.mode="edit",this.render()}),t.querySelectorAll(".task-item").forEach(s=>{s.addEventListener("click",i=>{if(i.target.closest(".delete-btn"))return;const a=s.dataset.id,o=this.tasks.find(u=>u.id===a);o&&(this.currentTask=o,this.engine.loadTask(o),this.mode="run",this.render())})}),t.querySelectorAll(".delete-btn").forEach(s=>{s.addEventListener("click",i=>{i.stopPropagation();const n=s.dataset.id;confirm("确定删除这个任务吗？")&&(this.tasks=this.tasks.filter(a=>a.id!==n),f(this.tasks),this.render())})})}bindEditEvents(){var e,s,i;const t=document.getElementById("app");(e=t.querySelector("#btn-back"))==null||e.addEventListener("click",()=>{this.mode="list",this.render()}),(s=t.querySelector("#btn-save"))==null||s.addEventListener("click",()=>{const a=t.querySelector("#task-title").value.trim();if(!a){alert("请输入任务名称");return}const o=t.querySelectorAll(".subtimer-item"),u=[];if(o.forEach((d,c)=>{var y;const k=d.querySelector(".st-name"),I=d.querySelector(".st-minutes"),w=d.querySelector(".st-seconds"),S=k.value.trim()||`子任务 ${c+1}`,E=parseInt(I.value)||0,C=parseInt(w.value)||0,x=E*60+C;u.push({id:((y=this.currentTask.subTimers[c])==null?void 0:y.id)||p(),name:S,duration:x>0?x:60})}),u.length===0){alert("请添加至少一个子任务");return}this.currentTask.title=a,this.currentTask.subTimers=u;const m=this.tasks.findIndex(d=>d.id===this.currentTask.id);m>=0?this.tasks[m]=this.currentTask:this.tasks.push(this.currentTask),f(this.tasks),this.mode="list",this.render()}),(i=t.querySelector("#btn-add-st"))==null||i.addEventListener("click",()=>{this.saveCurrentSubTimersFromDom(),this.currentTask.subTimers.push({id:p(),name:"",duration:60});const n=t.querySelector("#subtimer-list");n.innerHTML=g(this.currentTask.subTimers),this.bindSubTimerEvents()}),this.bindSubTimerEvents()}bindSubTimerEvents(){const t=document.getElementById("app");t.querySelectorAll(".remove-st").forEach(e=>{e.addEventListener("click",()=>{this.saveCurrentSubTimersFromDom();const s=parseInt(e.dataset.index);this.currentTask.subTimers.splice(s,1);const i=t.querySelector("#subtimer-list");i.innerHTML=g(this.currentTask.subTimers),this.bindSubTimerEvents()})})}saveCurrentSubTimersFromDom(){document.getElementById("app").querySelectorAll(".subtimer-item").forEach((s,i)=>{const n=s.querySelector(".st-name"),a=s.querySelector(".st-minutes"),o=s.querySelector(".st-seconds"),u=n.value.trim()||`子任务 ${i+1}`,m=parseInt(a.value)||0,d=parseInt(o.value)||0,c=m*60+d;this.currentTask.subTimers[i]&&(this.currentTask.subTimers[i].name=u,this.currentTask.subTimers[i].duration=c>0?c:60)})}bindRunEvents(){var e,s,i,n,a,o;const t=document.getElementById("app");(e=t.querySelector("#btn-back"))==null||e.addEventListener("click",()=>{this.engine.stop(),this.mode="list",this.render()}),(s=t.querySelector("#btn-start"))==null||s.addEventListener("click",()=>{this.engine.start(),this.render()}),(i=t.querySelector("#btn-pause"))==null||i.addEventListener("click",()=>{this.engine.pause(),this.render()}),(n=t.querySelector("#btn-resume"))==null||n.addEventListener("click",()=>{this.engine.resume(),this.render()}),(a=t.querySelector("#btn-stop"))==null||a.addEventListener("click",()=>{this.engine.stop(),this.render()}),(o=t.querySelector("#btn-skip"))==null||o.addEventListener("click",()=>{this.engine.skipToNext(),this.render()})}}new O;
