export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-200 text-slate-800 font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/60 rounded-full blur-3xl pointer-events-none" />

      {/* Header Skeleton */}
      <header className="fixed top-0 inset-x-0 h-24 flex items-center justify-between px-8 md:px-12 z-40 bg-white/40 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="hidden sm:block h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-white/50 rounded-full border border-slate-200 animate-pulse" />
          <div className="h-10 w-28 bg-slate-200 rounded-full animate-pulse" />
        </div>
      </header>

      {/* Main Layout Skeleton */}
      <main className="pt-32 pb-12 px-6 md:px-12 min-h-screen max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* 3-Column Task Cards Layout Skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch h-[calc(100vh-14rem)]">
          
          {/* Yesterday Card Skeleton */}
          <div className="hidden lg:flex relative transform lg:scale-95 opacity-50 flex-col bg-white/50 backdrop-blur-md rounded-[2rem] p-6 shadow-md border border-white/60">
            <div className="space-y-4">
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="pt-8 space-y-4">
                <div className="h-16 w-full bg-white/80 rounded-2xl animate-pulse" />
                <div className="h-16 w-full bg-white/80 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Today Card Skeleton */}
          <div className="relative transform z-20 flex flex-col bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200 ring-1 ring-slate-100/50 h-full">
            <div className="space-y-4">
              <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="pt-10 space-y-6">
                <div className="h-20 w-full bg-slate-50 rounded-2xl animate-pulse" />
                <div className="h-20 w-full bg-slate-50 rounded-2xl animate-pulse" />
                <div className="h-20 w-full bg-slate-50 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Tomorrow Card Skeleton */}
          <div className="hidden lg:flex relative transform lg:scale-95 opacity-50 flex-col bg-white/50 backdrop-blur-md rounded-[2rem] p-6 shadow-md border border-white/60">
            <div className="space-y-4">
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="pt-8 space-y-4">
                <div className="h-16 w-full bg-white/80 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
