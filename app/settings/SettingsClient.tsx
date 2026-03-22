"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { UserPlus, Users, ArrowLeft, Trash2, KeyRound } from "lucide-react";

type UserType = {
  id: number;
  username: string;
  role: string;
  createdAt: Date;
};

export default function SettingsClient({ initialUsers }: { initialUsers: UserType[] }) {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });

      if (res.ok) {
        setSuccess("用户创建成功！");
        setNewUsername("");
        setNewPassword("");
        const updatedUsers = await fetch("/api/users").then(r => r.json());
        setUsers(updatedUsers);
      } else {
        const data = await res.json();
        setError(data.error || "创建失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (!confirm(`确定要彻底删除用户 "${username}" 及其所有的任务和记录吗？此操作不可逆！`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("删除失败，请稍后重试");
      }
    } catch (err) {
      alert("网络错误，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans p-6 md:p-12 relative overflow-hidden transition-colors duration-500">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none transition-colors duration-700" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/60 dark:bg-slate-800/40 rounded-full blur-3xl pointer-events-none transition-colors duration-700" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-3 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full shadow-sm hover:shadow transition-all group border border-transparent dark:border-slate-700"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-700 dark:text-slate-100 tracking-tight transition-colors">管理员设置</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add User Card */}
          <div className="lg:col-span-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-md border border-white dark:border-slate-800 flex flex-col items-start justify-start h-fit transition-colors duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">添加新用户</h2>
            </div>
            
            {error && <div className="w-full p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">{error}</div>}
            {success && <div className="w-full p-3 mb-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-xl border border-green-100 dark:border-green-900/50">{success}</div>}

            <form onSubmit={handleCreateUser} className="w-full space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">用户名</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="输入用户名"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 font-medium transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">初始密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="输入密码"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 font-medium transition-colors"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !newUsername || !newPassword}
                className="w-full py-3.5 bg-slate-700 dark:bg-slate-200 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md transition-all disabled:opacity-50 mt-4"
              >
                {loading ? "正在处理..." : "确认添加"}
              </button>
            </form>
          </div>

          {/* User List Card */}
          <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-md border border-white dark:border-slate-800 transition-colors duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">用户列表</h2>
              </div>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-lg text-sm font-bold border border-transparent dark:border-slate-700">
                共 {users.length} 名用户
              </span>
            </div>

            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-xl uppercase">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">{user.username}</h4>
                      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">加入于 {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                      href={`/settings/user/${user.id}/tasks`}
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950 font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                    >
                      查看其任务
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="p-2 text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                      title="删除用户"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <KeyRound className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-700" />
                  <p>暂无其他用户</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
