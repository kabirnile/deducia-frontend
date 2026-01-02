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
  const [activeTab, setActiveTab] = useState("BATCHES"); // Controls which view is shown
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
      setError("Connection error. Server might be sleeping.");
    }
    setLoading(false);
  };

  const fetchCourses = () => {
    fetch(`${API_BASE}/api/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Error:", err));
  };

  // --- VIEW 1: LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Login</h1>
            <p className="text-gray-500 mt-2">Enter your mobile number to proceed</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span className="bg-gray-100 px-3 py-3 text-gray-500 font-medium border-r">+91</span>
                <input 
                  type="tel" 
                  placeholder="Enter 10 digit number" 
                  className="flex-1 px-4 py-3 outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-70"
            >
              {loading ? "Verifying OTP..." : "Get OTP"}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-gray-400">By continuing, you agree to our Terms & Privacy Policy.</p>
        </div>
      </div>
    );
  }

  // --- VIEW 2: PW-STYLE DASHBOARD ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. SIDEBAR (Exact PW Menu) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Deducia</span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2 mt-2">Academics</div>
          <SidebarItem icon={<BookOpenIcon />} label="STUDY" active={activeTab === "STUDY"} onClick={() => setActiveTab("STUDY")} />
          <SidebarItem icon={<ChartBarIcon />} label="PI" active={activeTab === "PI"} onClick={() => setActiveTab("PI")} />
          <SidebarItem icon={<LibraryIcon />} label="LIBRARY" active={activeTab === "LIBRARY"} onClick={() => setActiveTab("LIBRARY")} />
          <SidebarItem icon={<LayersIcon />} label="BATCHES" active={activeTab === "BATCHES"} onClick={() => setActiveTab("BATCHES")} />
          <SidebarItem icon={<ClipboardCheckIcon />} label="TEST SERIES" active={activeTab === "TEST SERIES"} onClick={() => setActiveTab("TEST SERIES")} />
          
          <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2 mt-6">Explore</div>
          <SidebarItem icon={<BuildingIcon />} label="CENTRES" active={activeTab === "CENTRES"} onClick={() => setActiveTab("CENTRES")} />
          <SidebarItem icon={<ShoppingBagIcon />} label="STORE" active={activeTab === "STORE"} onClick={() => setActiveTab("STORE")} />
          
          <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2 mt-6">Support</div>
          <SidebarItem icon={<PhoneIcon />} label="CONTACT US" active={activeTab === "CONTACT US"} onClick={() => setActiveTab("CONTACT US")} />
          <SidebarItem icon={<InfoIcon />} label="ABOUT US" active={activeTab === "ABOUT US"} onClick={() => setActiveTab("ABOUT US")} />
          <SidebarItem icon={<ShieldIcon />} label="PRIVACY POLICY" active={activeTab === "PRIVACY POLICY"} onClick={() => setActiveTab("PRIVACY POLICY")} />
        </nav>

        {/* User Mini Profile */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
           <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
               {user.full_name ? user.full_name[0] : "S"}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-900 truncate">{user.full_name || "Kabir Hussain"}</p>
               <p className="text-xs text-gray-500 truncate">+91 {user.phone}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-bold text-gray-800">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
             {/* Search Bar */}
             <div className="hidden md:block relative">
               <input type="text" placeholder="Search for batches..." className="bg-gray-100 text-sm rounded-full py-2 px-4 pl-10 w-64 focus:ring-2 focus:ring-blue-500 outline-none" />
               <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
             </div>
             <button onClick={() => setUser(null)} className="text-sm font-medium text-red-600">Logout</button>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          
          {/* LOGIC: Show content based on which Sidebar button is clicked */}
          
          {activeTab === "BATCHES" || activeTab === "STUDY" ? (
            // --- BATCHES VIEW (The Main Product) ---
            <div className="space-y-8">
              {/* Marketing Carousel */}
              <div className="w-full h-48 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl flex items-center px-10 relative overflow-hidden shadow-xl">
                 <div className="z-10 text-white">
                   <h3 className="text-2xl font-bold mb-2">UPSC Prelims 2027</h3>
                   <p className="text-blue-100 mb-4 max-w-lg">Join the new foundation batch starting this week. Complete syllabus coverage.</p>
                   <button className="bg-white text-blue-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition">Explore Now</button>
                 </div>
                 <div className="absolute right-0 top-0 h-full w-1/2 bg-white opacity-5 transform skew-x-12"></div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">My Batches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.length === 0 ? <p>Loading...</p> : courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition duration-200 flex flex-col overflow-hidden">
                      <div className="h-44 bg-gray-300 relative">
                        <img src={course.thumbnail_url} alt="Course" className="w-full h-full object-cover"/>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">hinglish</div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h4 className="font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h4>
                        <div className="mt-auto">
                          <a href={`/course/${course.id}`} className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                            Let's Study
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : (
            // --- PLACEHOLDER FOR OTHER TABS ---
            <div className="flex flex-col items-center justify-center h-full text-center">
               <div className="bg-white p-8 rounded-full shadow-sm mb-4">
                 <span className="text-4xl">🚧</span>
               </div>
               <h3 className="text-xl font-bold text-gray-800">Coming Soon</h3>
               <p className="text-gray-500 max-w-sm mt-2">
                 The <b>{activeTab}</b> feature is currently under development. We are focusing on "Batches" first.
               </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// --- ICONS (SVG) ---
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm tracking-wide">{label}</span>
    </div>
  );
}

// Icons
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const LibraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25h16.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25m-16.5 0v-7.5c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v7.5m-9 0h9" /></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>;
