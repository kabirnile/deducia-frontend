"use client";
import { useState, useEffect } from 'react';

// Environment Variable Logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function Home() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- LOGIN LOGIC ---
  const handleLogin = async (e) => {
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
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Connection error.");
    }
    setLoading(false);
  };

  const fetchCourses = () => {
    fetch(`${API_BASE}/api/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Error:", err));
  };

  // --- VIEW 1: LOGIN SCREEN (Simple & Clean) ---
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
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-bold text-gray-900">Deducia<span className="text-purple-600">.</span></span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem icon={<HomeIcon />} label="Home" />
          <SidebarItem icon={<BookIcon />} label="My Batches" active />
          <SidebarItem icon={<BeakerIcon />} label="Test Series" />
          <SidebarItem icon={<FolderIcon />} label="Library" />
          <div className="pt-4 mt-4 border-t border-gray-100">
            <SidebarItem icon={<CenterIcon />} label="Offline Centres" />
            <SidebarItem icon={<StoreIcon />} label="Store" />
          </div>
        </nav>

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
               {user.full_name ? user.full_name[0] : "S"}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || "Student"}</p>
               <p className="text-xs text-gray-500 truncate">+91 {user.phone}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <h1 className="text-lg font-bold text-gray-800 md:hidden">Deducia</h1>
          <div className="hidden md:flex flex-1 max-w-xl ml-4">
             <div className="relative w-full">
               <input type="text" placeholder="Search for batches..." className="w-full bg-gray-100 border-none rounded-md py-2 px-4 pl-10 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
               <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setUser(null)} className="text-sm font-medium text-red-600 hover:text-red-700">Logout</button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* Hero Banner (Sale/Promo) */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 md:p-10 text-white mb-8 shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-3xl font-bold mb-2">Year End Sale!</h2>
               <p className="text-emerald-100 mb-6">Get 50% off on all UPSC 2027 Batches. Offer ends soon.</p>
               <button className="bg-white text-emerald-800 px-6 py-2 rounded-lg font-bold hover:bg-emerald-50 transition">Explore Batches</button>
             </div>
             {/* Decorative Circles */}
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
             <div className="absolute bottom-0 right-20 w-20 h-20 bg-white opacity-10 rounded-full"></div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Batches</h2>

          {/* COURSE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? <p className="text-gray-500">Loading your courses...</p> : courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                {/* Thumbnail */}
                <div className="h-48 bg-gray-200 relative">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover"/>
                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">LIVE</div>
                </div>
                
                {/* Content */}
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

        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS (ICONS) ---
function SidebarItem({ icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${active ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

// Simple SVG Icons (Copied to avoid installing libraries)
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const BeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>;
const CenterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>;
