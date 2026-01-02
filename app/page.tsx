"use client";
import { useState, useEffect } from 'react';

// Environment Variable Logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  
  // Safe State Initialization
  const [courses, setCourses] = useState<any[]>([]); 
  const [tests, setTests] = useState<any[]>([]); 
  
  const [activeTab, setActiveTab] = useState("BATCHES"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- LOGIN LOGIC ---
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        fetchCourses();
        fetchTests(); 
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Connection error. Server might be sleeping.");
    }
    setLoading(false);
  };

  // --- SAFER DATA FETCHING ---
  const fetchCourses = () => {
    fetch(`${API_BASE}/api/courses`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
        else setCourses([]);
      })
      .catch((err) => setCourses([]));
  };

  const fetchTests = () => {
    fetch(`${API_BASE}/api/tests`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTests(data);
        else setTests([]); 
      })
      .catch((err) => setTests([]));
  };

  // --- VIEW 1: LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Enter your registered number to continue learning</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input 
                type="text" 
                placeholder="Mobile Number" 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-600 focus:ring-purple-600 outline-none transition"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-purple-300"
            >
              {loading ? "Verifying..." : "Login Securely"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 2: PW-STYLE DASHBOARD ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-bold text-gray-900">Deducia<span className="text-purple-600">.</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2 mt-2">Academics</div>
          <SidebarItem icon={<BookOpenIcon />} label="STUDY" active={activeTab === "STUDY"} onClick={() => setActiveTab("STUDY")} />
          <SidebarItem icon={<LayersIcon />} label="BATCHES" active={activeTab === "BATCHES"} onClick={() => setActiveTab("BATCHES")} />
          <SidebarItem icon={<ClipboardCheckIcon />} label="TEST SERIES" active={activeTab === "TEST SERIES"} onClick={() => setActiveTab("TEST SERIES")} />
          
          <div className="pt-4 mt-4 border-t border-gray-100">
             <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">Explore</div>
             <SidebarItem icon={<ShoppingBagIcon />} label="STORE" active={activeTab === "STORE"} onClick={() => setActiveTab("STORE")} />
             <SidebarItem icon={<BuildingIcon />} label="OFFLINE CENTRES" />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
               {user.full_name ? user.full_name[0] : "S"}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || "Student"}</p>
               <p className="text-xs text-gray-500 truncate cursor-pointer hover:text-red-600" onClick={() => setUser(null)}>Logout</p>
             </div>
           </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <h1 className="text-lg font-bold text-gray-800">{activeTab}</h1>
          <div className="hidden md:flex flex-1 max-w-xl ml-4">
             <div className="relative w-full">
               <input type="text" placeholder="Search..." className="w-full bg-gray-100 border-none rounded-md py-2 px-4 pl-10 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
               <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
             </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          
          {/* LOGIC: Show content based on Sidebar Click */}

          {/* === BATCHES TAB === */}
          {(activeTab === "BATCHES" || activeTab === "STUDY") && (
            <>
                {/* HERO BANNER */}
                <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 md:p-10 text-white mb-8 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Year End Sale!</h2>
                    <p className="text-emerald-100 mb-6">Get 50% off on all UPSC 2027 Batches. Offer ends soon.</p>
                    <button className="bg-white text-emerald-800 px-6 py-2 rounded-lg font-bold hover:bg-emerald-50 transition">Explore Batches</button>
                    </div>
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                     <p className="text-gray-400 col-span-full text-center">No batches found. Ask Admin to upload.</p>
                ) : courses.map((course: any) => (
                    <div key={course.id || Math.random()} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                    <div className="h-48 bg-gray-200 relative">
                        <img src={course.thumbnail_url || "https://placehold.co/600x400"} alt={course.title} className="w-full h-full object-cover"/>
                        <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">LIVE</div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>🗓️ Starts Today</span>
                        <span>•</span>
                        <span>Hinglish</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-100">
                        <a href={`/course/${course.id}`} className="block w-full text-center bg-purple-600 text-white font-semibold py-2.5 rounded-lg hover:bg-purple-700 transition">
                            Resume Learning
                        </a>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </>
          )}

          {/* === TEST SERIES TAB === */}
          {activeTab === "TEST SERIES" && (
             <div className="space-y-4">
               {tests.length === 0 ? (
                 <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">📝 No active tests found.</p>
                 </div>
               ) : (
                 tests.map((test: any) => (
                   <div key={test.id || Math.random()} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
                     <div>
                       <h3 className="text-lg font-bold text-gray-900">{test.title}</h3>
                       <p className="text-sm text-gray-500">Duration: {test.duration_minutes} Mins • Questions: Mixed</p>
                     </div>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">
  Attempt Now
</button>
                   </div>
                 ))
               )}
             </div>
          )}

          {/* === STORE TAB === */}
          {activeTab === "STORE" && <div className="text-center mt-20 text-gray-400">Store Coming Soon</div>}

        </div>
      </main>
    </div>
  );
}

// --- ICONS ---
function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${active ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>;
