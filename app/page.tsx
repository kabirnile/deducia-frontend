"use client";
import { useState, useEffect } from 'react';

// Environment Variable Logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function Home() {
  const [user, setUser] = useState<any>(null);
  
  // Auth States
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data States
  const [allCourses, setAllCourses] = useState<any[]>([]); 
  const [myCourses, setMyCourses] = useState<any[]>([]); 
  const [tests, setTests] = useState<any[]>([]); 
  const [myScores, setMyScores] = useState<any[]>([]);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState("HOME"); 

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const savedUser = localStorage.getItem('studentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserData(parsedUser.id);
    }
  }, []);

  const loadUserData = (userId: number) => {
    fetch(`${API_BASE}/api/courses`).then(res=>res.json()).then(data => setAllCourses(Array.isArray(data)?data:[]));
    fetch(`${API_BASE}/api/tests`).then(res=>res.json()).then(data => setTests(Array.isArray(data)?data:[]));
    fetch(`${API_BASE}/api/my-batches?student_id=${userId}`).then(res=>res.json()).then(data => setMyCourses(Array.isArray(data)?data:[]));
    fetch(`${API_BASE}/api/my-results?student_id=${userId}`).then(res=>res.json()).then(data => setMyScores(Array.isArray(data)?data:[]));
  };

  // --- 2. AUTH HANDLERS ---
  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true); setError("");
    const endpoint = isNewUser ? '/api/signup' : '/api/login';
    const payload = isNewUser ? { phone, full_name: fullName } : { phone };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            setUser(data.user);
            localStorage.setItem('studentUser', JSON.stringify(data.user));
            loadUserData(data.user.id);
        } else {
            if (!isNewUser && endpoint.includes('login')) setIsNewUser(true);
            else setError(data.message || "Error");
        }
    } catch(err) { setError("Connection Failed"); }
    setLoading(false);
  };

  const handleEnroll = async (courseId: number) => {
    if(!confirm("Join this batch for free?")) return;
    await fetch(`${API_BASE}/api/enroll`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ student_id: user.id, course_id: courseId })
    });
    alert("Batch Joined!");
    loadUserData(user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentUser');
    setUser(null);
  };

  // --- VIEW 1: LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h1 className="text-3xl font-bold text-center mb-2">{isNewUser ? "Create Profile" : "Login"}</h1>
            <p className="text-gray-400 text-center mb-6 text-sm">Your learning journey starts here</p>
            <form onSubmit={handleAuth} className="space-y-4">
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile Number" className="w-full border p-3 rounded-lg focus:ring-2 ring-purple-500 outline-none" />
                {isNewUser && <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full Name" className="w-full border p-3 rounded-lg focus:ring-2 ring-purple-500 outline-none" />}
                <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 transition">{loading?"Processing...":"Continue"}</button>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
            </form>
        </div>
      </div>
    );
  }

  // --- VIEW 2: PW-STYLE DASHBOARD ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-bold">Deducia<span className="text-purple-600">.</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main Learning */}
          <SidebarItem label="Dashboard" icon="🏠" active={activeTab==="HOME"} onClick={()=>setActiveTab("HOME")} />
          <SidebarItem label="My Batches" icon="🎓" active={activeTab==="MY_BATCHES"} onClick={()=>setActiveTab("MY_BATCHES")} />
          <SidebarItem label="Khazana" icon="💎" active={activeTab==="KHAZANA"} onClick={()=>setActiveTab("KHAZANA")} isNew={true} />
          
          {/* Practice & Doubt */}
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">PRACTICE</div>
          <SidebarItem label="Test Series" icon="📝" active={activeTab==="TESTS"} onClick={()=>setActiveTab("TESTS")} />
          <SidebarItem label="Doubts" icon="❓" active={activeTab==="DOUBTS"} onClick={()=>setActiveTab("DOUBTS")} />
          <SidebarItem label="Library" icon="📚" active={activeTab==="LIBRARY"} onClick={()=>setActiveTab("LIBRARY")} />

          {/* Explore */}
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">EXPLORE</div>
          <SidebarItem label="All Batches" icon="🌍" active={activeTab==="ALL_BATCHES"} onClick={()=>setActiveTab("ALL_BATCHES")} />
          <SidebarItem label="PW Centers" icon="🏢" active={activeTab==="CENTERS"} onClick={()=>setActiveTab("CENTERS")} />
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">{user.full_name[0]}</div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
               <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Logout</button>
             </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden bg-gray-50">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
            <h2 className="text-lg font-bold">{activeTab.replace('_', ' ')}</h2>
            <div className="flex items-center gap-4">
                <span className="text-2xl cursor-pointer">🔔</span>
                <span className="text-2xl cursor-pointer">🛒</span>
            </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">

            {/* === 1. DASHBOARD HOME (Overview) === */}
            {activeTab === "HOME" && (
                <div className="space-y-8">
                    {/* Welcome Header */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Hi, {user.full_name} 👋</h1>
                            <p className="text-gray-500">Let's continue your preparation for UPSC 2027</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard label="Batches Joined" value={myCourses.length} color="bg-blue-100 text-blue-700" />
                        <StatCard label="Tests Attempted" value={myScores.length} color="bg-green-100 text-green-700" />
                        <StatCard label="Hours Watched" value="12.5" color="bg-purple-100 text-purple-700" />
                        <StatCard label="Doubts Asked" value="0" color="bg-orange-100 text-orange-700" />
                    </div>

                    {/* Schedule Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">📅 Today's Schedule</h3>
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                            No live classes scheduled for today. <br/>
                            <span className="text-sm">Check "My Batches" for recorded lectures.</span>
                        </div>
                    </div>

                    {/* Continue Watching */}
                    {myCourses.length > 0 && (
                        <div>
                            <h3 className="font-bold text-lg mb-4">▶ Continue Learning</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myCourses.slice(0, 3).map(course => (
                                    <CourseCard key={course.id} course={course} isEnrolled={true} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === 2. MY BATCHES === */}
            {activeTab === "MY_BATCHES" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.length === 0 ? <EmptyState msg="No batches yet. Go to 'All Batches' to join one!" /> : 
                     myCourses.map(course => <CourseCard key={course.id} course={course} isEnrolled={true} />)}
                </div>
            )}

            {/* === 3. KHAZANA (Placeholder) === */}
            {activeTab === "KHAZANA" && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">💎</div>
                    <h2 className="text-2xl font-bold">Welcome to Khazana</h2>
                    <p className="text-gray-500 max-w-md mx-auto mt-2">Access India's best faculty lectures for any topic. This premium feature is unlocking soon for your account.</p>
                </div>
            )}

            {/* === 4. ALL BATCHES (Explore) === */}
            {activeTab === "ALL_BATCHES" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allCourses.map(course => {
                        const isEnrolled = myCourses.some(c => c.id === course.id);
                        return (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
                                <img src={course.thumbnail_url} className="h-40 object-cover bg-gray-200" />
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                    <div className="mt-auto">
                                        {isEnrolled ? (
                                            <button disabled className="w-full bg-green-100 text-green-700 py-2 rounded font-bold">✅ Joined</button>
                                        ) : (
                                            <button onClick={()=>handleEnroll(course.id)} className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">Join Batch</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* === 5. TEST SERIES === */}
            {activeTab === "TESTS" && (
                <div className="space-y-4">
                    {tests.map(test => {
                        const myScore = myScores.find(s => s.test_id === test.id);
                        return (
                            <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center hover:shadow-md transition">
                                <div>
                                    <h3 className="font-bold text-lg">{test.title}</h3>
                                    <p className="text-gray-500 text-sm">{test.duration_minutes} Mins • 50 Marks</p>
                                </div>
                                {myScore ? (
                                    <div className="text-right">
                                        <span className="block text-sm text-gray-500">Score</span>
                                        <span className="text-2xl font-bold text-blue-600">{myScore.score}/{myScore.total_marks}</span>
                                    </div>
                                ) : (
                                    <a href={`/test/${test.id}`} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Attempt</a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* === 6. DOUBTS & LIBRARY === */}
            {(activeTab === "DOUBTS" || activeTab === "LIBRARY" || activeTab === "CENTERS") && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">🚧 Feature Under Construction</p>
                    <p className="text-sm mt-2">We are building this {activeTab.toLowerCase()} module for you.</p>
                </div>
            )}

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ label, icon, active, onClick, isNew }: any) {
    return (
        <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition select-none ${active ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <span>{icon}</span>
            <span className="flex-1">{label}</span>
            {isNew && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">NEW</span>}
        </div>
    );
}

function StatCard({ label, value, color }: any) {
    return (
        <div className={`p-6 rounded-xl border ${color.replace('text-', 'border-').replace('100', '200')} bg-white`}>
            <h3 className="text-gray-500 font-bold text-xs uppercase">{label}</h3>
            <p className={`text-3xl font-extrabold mt-2 ${color.split(' ')[1]}`}>{value}</p>
        </div>
    );
}

function CourseCard({ course, isEnrolled }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition">
            <div className="h-40 bg-gray-200 relative">
                <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">hinglish</div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-4">Physics Wallah Team</p>
                <div className="mt-auto">
                    <a href={`/course/${course.id}`} className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
                        {isEnrolled ? "Resume Learning ▶" : "View Details"}
                    </a>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ msg }: any) {
    return (
        <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-xl text-gray-400">{msg}</p>
        </div>
    );
}
