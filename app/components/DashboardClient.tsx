"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from "date-fns";
import { PlusCircle, CheckCircle2, Circle, Clock, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, X as CloseIcon } from "lucide-react";
import Link from "next/link";

type TaskLog = {
  id: number;
  taskId: number;
  scheduleDate: string;
  status: boolean;
  title: string;
  tag: string | null;
};

type DailyStatus = {
  [dateStr: string]: { completed: number; total: number }
};

interface DashboardClientProps {
  initialTasks: {
    yesterday: TaskLog[];
    today: TaskLog[];
    tomorrow: TaskLog[];
  };
  initialCalendarStatus: DailyStatus;
}

export default function DashboardClient({ initialTasks, initialCalendarStatus }: DashboardClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [calendarStatus, setCalendarStatus] = useState(initialCalendarStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("其他");

  const SUBJECT_TAGS = [
    { name: "语文", color: "from-rose-400 to-rose-500", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
    { name: "数学", color: "from-blue-400 to-blue-500", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    { name: "英语", color: "from-emerald-400 to-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    { name: "物理", color: "from-violet-400 to-violet-500", bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
    { name: "化学", color: "from-amber-400 to-amber-500", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    { name: "生物", color: "from-teal-400 to-teal-500", bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-100" },
    { name: "其他", color: "from-slate-400 to-slate-500", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" },
  ];

  const getTagStyle = (tagName: string | null) => {
    return SUBJECT_TAGS.find(t => t.name === tagName) || SUBJECT_TAGS[6];
  };
  
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<TaskLog[] | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const todayDate = new Date();
  const yesterdayDate = subDays(todayDate, 1);
  const tomorrowDate = addDays(todayDate, 1);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fetchTasks = async () => {
    try {
      const formattedToday = format(todayDate, "yyyy-MM-dd");
      const formattedYesterday = format(yesterdayDate, "yyyy-MM-dd");
      const formattedTomorrow = format(tomorrowDate, "yyyy-MM-dd");

      const [resY, resT, resTom] = await Promise.all([
        fetch(`/api/tasks?date=${formattedYesterday}`).then(res => res.json()),
        fetch(`/api/tasks?date=${formattedToday}`).then(res => res.json()),
        fetch(`/api/tasks?date=${formattedTomorrow}`).then(res => res.json()),
      ]);

      setTasks({
        yesterday: Array.isArray(resY) ? resY : [],
        today: Array.isArray(resT) ? resT : [],
        tomorrow: Array.isArray(resTom) ? resTom : [],
      });
    } catch (error) {
      console.error("加载任务失败", error);
    }
  };

  const fetchMonthStatus = async () => {
    try {
      const formattedStart = format(startOfMonth(viewDate), "yyyy-MM-dd");
      const formattedEnd = format(endOfMonth(viewDate), "yyyy-MM-dd");
      const resCal = await fetch(`/api/tasks/month?start=${formattedStart}&end=${formattedEnd}`).then(res => res.json());
      setCalendarStatus(resCal || {});
    } catch (error) {
      console.error("加载月度状态失败", error);
    }
  };

  // Skip initial fetch since we have props, but we still want to refresh on mount to ensure latest?
  // Actually, Server Component handles initial. Client refresh is only for user actions.
  // But we still need fetchMonthStatus when viewDate changes.
  useEffect(() => {
    fetchMonthStatus();
  }, [viewDate]);

  const handlePrevMonth = () => setViewDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setViewDate(prev => addMonths(prev, 1));

  const handleDayClick = async (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    setSelectedDayDate(format(day, "yyyy年MM月dd日"));
    
    try {
      const res = await fetch(`/api/tasks?date=${dayStr}`).then(r => r.json());
      setSelectedDayTasks(Array.isArray(res) ? res : []);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("加载日期详情失败", error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTaskTitle,
          tag: selectedTag,
          localDate: format(todayDate, "yyyy-MM-dd") 
        }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        setSelectedTag("其他");
        setIsModalOpen(false);
        fetchTasks();
        fetchMonthStatus();
      }
    } catch (error) {
      console.error("添加任务失败", error);
    }
  };

  const toggleTaskStatus = async (id: number, currentStatus: boolean, daySection: 'yesterday' | 'today' | 'tomorrow' | 'preview') => {
    if (daySection !== 'preview') {
      setTasks(prev => ({
        ...prev,
        [daySection]: prev[daySection].map(task => 
          task.id === id ? { ...task, status: !currentStatus } : task
        )
      }));
    } else {
      setSelectedDayTasks(prev => 
        prev ? prev.map(task => task.id === id ? { ...task, status: !currentStatus } : task) : null
      );
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });
      if (res.ok) {
        fetchMonthStatus();
        if (daySection !== 'preview') fetchTasks();
      }
    } catch (error) {
      console.error("更新状态失败", error);
      fetchTasks();
      fetchMonthStatus();
    }
  };

  const TaskCardList = ({ 
    dateString, 
    tasksList, 
    title, 
    daySection 
  }: { 
    dateString: string, 
    tasksList: TaskLog[], 
    title: string, 
    daySection: 'yesterday' | 'today' | 'tomorrow' | 'preview'
  }) => (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col px-2">
        <h2 className={`text-2xl font-bold ${daySection === 'preview' ? 'text-slate-800' : 'text-slate-700'}`}>{title}</h2>
        <span className="text-sm font-medium text-slate-400 mt-1">{dateString}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-4 mt-4">
        {tasksList.length === 0 ? (
          <div className={`h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl ${daySection === 'preview' ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white/50'}`}>
            <Clock className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">没有安排任务</p>
          </div>
        ) : (
          tasksList.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center p-4 rounded-2xl transition-all duration-300 backdrop-blur-md border ${
                task.status 
                  ? 'bg-slate-100/80 border-slate-200/60' 
                  : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-300 cursor-pointer shadow-sm hover:shadow-md'
              }`}
              onClick={() => toggleTaskStatus(task.id, task.status, daySection)}
            >
              <button className="mr-4 focus:outline-none flex-shrink-0 transition-transform group-hover:scale-110 group-active:scale-95">
                {task.status ? (
                  <CheckCircle2 className="w-6 h-6 text-slate-400" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 group-hover:text-slate-500" />
                )}
              </button>
              
              {task.tag && (
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold mr-3 border ${getTagStyle(task.tag).bg} ${getTagStyle(task.tag).text} ${getTagStyle(task.tag).border} shadow-sm flex-shrink-0`}>
                  {task.tag}
                </div>
              )}

              <span className={`text-lg font-medium transition-all ${
                task.status ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}>
                {task.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-200 text-slate-800 font-sans selection:bg-slate-300/50 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/60 rounded-full blur-3xl pointer-events-none" />

      <header className="fixed top-0 inset-x-0 h-24 flex items-center justify-between px-8 md:px-12 z-40 bg-white/40 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-xl md:text-3xl font-extrabold text-slate-700 tracking-tight">
            艾宾浩斯日程计划
          </h1>
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-2 bg-white/60 hover:bg-white text-slate-600 px-4 py-2 rounded-xl font-semibold shadow-sm border border-slate-200 transition-all hover:scale-105 active:scale-95"
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="hidden sm:inline">月度视图</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/tasks"
            className="flex items-center gap-2 bg-white/50 hover:bg-white/80 text-slate-600 px-5 py-2.5 rounded-full font-semibold shadow-sm border border-slate-200 transition-all hover:scale-105 active:scale-95"
          >
            <List className="w-5 h-5" />
            <span className="hidden sm:inline">任务列表</span>
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">新任务</span>
          </button>
        </div>
      </header>

      <main className="pt-32 pb-12 px-6 md:px-12 min-h-screen max-w-[1600px] mx-auto flex flex-col gap-8">
        
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch h-[calc(100vh-14rem)]">
          
          <div className="hidden lg:flex relative transform lg:scale-95 opacity-80 blur-[0.5px] hover:blur-none hover:opacity-100 transition-all duration-500 ease-out flex-col bg-white/50 backdrop-blur-md rounded-[2rem] p-6 shadow-md border border-white/60">
            <TaskCardList 
              title="昨天" 
              dateString={format(yesterdayDate, "MM月dd日")} 
              tasksList={tasks.yesterday} 
              daySection="yesterday"
            />
          </div>

          <div className="relative transform z-20 flex flex-col bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200 ring-1 ring-slate-100/50 h-full">
            <TaskCardList 
              title="今天" 
              dateString={format(todayDate, "yyyy年 MM月dd日")} 
              tasksList={tasks.today} 
              daySection="today"
            />
          </div>

          <div className="hidden lg:flex relative transform lg:scale-95 opacity-80 blur-[0.5px] hover:blur-none hover:opacity-100 transition-all duration-500 ease-out flex-col bg-white/50 backdrop-blur-md rounded-[2rem] p-6 shadow-md border border-white/60">
            <TaskCardList 
              title="明天" 
              dateString={format(tomorrowDate, "MM月dd日")} 
              tasksList={tasks.tomorrow} 
              daySection="tomorrow"
            />
          </div>

        </section>
      </main>

      {isCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-xl border border-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-huge relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-100 via-slate-400 to-slate-100 opacity-20" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{format(viewDate, "yyyy年 MM月")}</h3>
                  <p className="text-slate-400 text-sm font-medium">查看并点击日期以预览打卡</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600 active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600 active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map(day => {
                const dayStr = format(day, "yyyy-MM-dd");
                const status = calendarStatus[dayStr];
                
                let bgColorClass = "bg-white border-slate-100 hover:border-slate-300"; 
                let textClass = "text-slate-400";

                if (status?.total > 0) {
                  if (status.completed === status.total) {
                    bgColorClass = "bg-green-500/10 border-green-200 hover:bg-green-500/20"; 
                    textClass = "text-green-700 font-bold";
                  } else {
                    bgColorClass = "bg-yellow-500/10 border-yellow-200 hover:bg-yellow-500/20"; 
                    textClass = "text-yellow-700 font-bold";
                  }
                }

                if (isToday(day)) {
                  bgColorClass += " ring-2 ring-slate-400 ring-offset-2";
                }

                return (
                  <div 
                    key={day.toString()} 
                    onClick={() => {
                        handleDayClick(day);
                        setIsCalendarOpen(false);
                    }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl border cursor-pointer transition-all shadow-sm ${bgColorClass}`}
                  >
                    <span className={`text-lg ${textClass}`}>
                      {format(day, "d")}
                    </span>
                    {status?.total > 0 && (
                      <span className="text-[10px] mt-0.5 opacity-60">
                        {status.completed}/{status.total}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && selectedDayTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-[2.5rem] p-10 shadow-huge relative">
            <button 
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <div className="h-[450px]">
               <TaskCardList 
                title={`${selectedDayDate} 任务预览`}
                dateString="点击任务即可快速打卡"
                tasksList={selectedDayTasks}
                daySection="preview"
              />
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-start items-center">
              <button 
                onClick={() => {
                    setIsPreviewModalOpen(false);
                    setIsCalendarOpen(true);
                }}
                className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                ← 返回日历
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">新建复习任务</h3>
            <p className="text-sm text-slate-500 mb-6">系统将自动按照艾宾浩斯遗忘曲线（1, 2, 4, 8, 14, 30天）为您安排复习打卡。</p>
            
            <form onSubmit={handleAddTask} className="space-y-6">
              <div>
                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="任务名称（例如：英语第一单元生词）"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-3">选择学科标签</label>
                <div className="grid grid-cols-4 gap-2">
                  {SUBJECT_TAGS.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => setSelectedTag(tag.name)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border-2 ${
                        selectedTag === tag.name
                          ? `${tag.bg} ${tag.text} ${tag.border.replace('border-', 'border-')} ring-2 ring-offset-1 ring-slate-200`
                          : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-5 py-2.5 rounded-xl font-bold bg-slate-600 hover:bg-slate-700 text-white transition-colors disabled:opacity-50 shadow-md"
                >
                  确认安排
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 5px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #94a3b8;
        }
        .shadow-huge {
          box-shadow: 0 30px 60px -12px rgba(50, 50, 93, 0.1), 0 18px 36px -18px rgba(0, 0, 0, 0.15);
        }
      `}} />
    </div>
  );
}
