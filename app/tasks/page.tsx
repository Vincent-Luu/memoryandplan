"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Trash2, Edit2, Check, X } from "lucide-react";
import Link from "next/link";

type Task = {
  id: number;
  title: string;
  tag: string | null;
  createdAt: string;
  totalLogs: number;
  completedLogs: number;
};

const SUBJECT_TAGS = [
  { name: "语文", color: "from-rose-400 to-rose-500", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  { name: "数学", color: "from-blue-400 to-blue-500", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  { name: "英语", color: "from-emerald-400 to-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  { name: "物理", color: "from-violet-400 to-violet-500", bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
  { name: "化学", color: "from-amber-400 to-amber-500", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  { name: "生物", color: "from-teal-400 to-teal-500", bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-100" },
  { name: "其他", color: "from-slate-400 to-slate-500", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" },
];

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTag, setEditTag] = useState<string>("其他");

  const getTagStyle = (tagName: string | null) => {
    return SUBJECT_TAGS.find(t => t.name === tagName) || SUBJECT_TAGS[6];
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks/all");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("加载任务列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEditClick = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditTag(task.tag || "其他");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditTag("其他");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/tasks/manage/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, tag: editTag }),
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, title: editTitle, tag: editTag } : t));
        setEditingId(null);
      }
    } catch (error) {
      console.error("更新任务失败", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个任务及其所有的复习安排吗？这是不可逆的操作！")) return;
    try {
      const res = await fetch(`/api/tasks/manage/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("删除任务失败", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-200 text-slate-800 font-sans selection:bg-slate-300/50">
      
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-24 flex items-center px-8 md:px-12 z-40 bg-white/40 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mr-6"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium hidden sm:inline">返回看板</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-700 tracking-tight border-l-2 border-slate-300 pl-6">
          所有任务列表
        </h1>
      </header>

      {/* Main Layout */}
      <main className="pt-32 pb-12 px-6 md:px-12 max-w-4xl mx-auto">
        
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white/80 min-h-[500px]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-slate-500 font-medium">加载中...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-slate-400">目前没有任何任务</span>
            </div>
          ) : (
            <ul className="space-y-4">
              {tasks.map(task => {
                const percentage = task.totalLogs > 0 ? Math.round((task.completedLogs / task.totalLogs) * 100) : 0;
                
                return (
                  <li 
                    key={task.id} 
                    className="group flex flex-col p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all gap-4"
                  >
                    
                    {editingId === task.id ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-bold text-lg"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveEdit(task.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Check className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-2">更改标签</p>
                          <div className="flex flex-wrap gap-2">
                            {SUBJECT_TAGS.map((tag) => (
                              <button
                                key={tag.name}
                                type="button"
                                onClick={() => setEditTag(tag.name)}
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                                  editTag === tag.name
                                    ? `${tag.bg} ${tag.text} ${tag.border} ring-2 ring-slate-200`
                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                }`}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              {task.tag && (
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getTagStyle(task.tag).bg} ${getTagStyle(task.tag).text} ${getTagStyle(task.tag).border} shadow-sm`}>
                                  {task.tag}
                                </span>
                              )}
                              <h3 className="text-lg font-bold text-slate-700">{task.title}</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">
                              创建于: {format(new Date(task.createdAt), "yyyy/MM/dd HH:mm")}
                            </p>
                            
                            {/* Progress Info */}
                            <div className="flex items-center gap-4 max-w-xs">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${percentage === 100 ? 'bg-green-400' : 'bg-slate-400'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                {task.completedLogs}/{task.totalLogs} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditClick(task)}
                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            title="编辑任务"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="删除任务"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}

                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </main>
    </div>
  );
}
