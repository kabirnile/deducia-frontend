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
  const [tests, setTests] = useState([]); // Store Tests here
  const [activeTab, setActiveTab] = useState("BATCHES"); 
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
        fetchTests(); // Fetch tests immediately after login
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

  const fetchTests = () => {
    fetch(`${API_BASE}/api/tests`)
      .then((res) => res.json())
      .then((data) => setTests(data))
      .catch((err) => console.error("Error fetching tests:", err));
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
        </div>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Deducia</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2 mt-2">Academics</div>
          <SidebarItem icon={<BookOpenIcon />} label="STUDY" active={activeTab === "STUDY"} onClick={() => setActiveTab("STUDY")} />
          <SidebarItem icon={<LayersIcon />} label="BATCHES" active={activeTab === "BATCHES"} onClick={() => setActiveTab("BATCHES")} />
          <SidebarItem icon={<ClipboardCheckIcon />} label="TEST SERIES" active={activeTab === "TEST SERIES"} onClick={() => setActiveTab("TEST SERIES")} />
          
          <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2 mt-6">Explore</div>
          <SidebarItem icon={<ShoppingBagIcon />} label="STORE" active={activeTab === "STORE"} onClick={() => setActiveTab("STORE")} />
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
           <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
               {user.full_name ? user.full_name[0] : "S"}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-900 truncate">{user.full_name || "Student"}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">{activeTab}</h2>
          <button onClick={() => setUser(null)} className="text-sm font-medium text-red-600">Logout</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          
          {/* --- TAB 1: BATCHES / STUDY --- */}
          {(activeTab === "BATCHES" || activeTab === "STUDY") && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length === 0 ? <p>No batches available.</p> : courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden">
                  <div className="h-44 bg-gray-300 relative">
                    <img src={course.thumbnail_url} alt="Course" className="w-full h-full object-cover"/>
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
          )}

          {/* --- TAB 2: TEST SERIES (NEW CODE) --- */}
          {activeTab === "TEST SERIES" && (
             <div className="space-y-4">
               {tests.length === 0 ? (
                 <div className="text-center py-20 text-gray-500">No active tests found. Check back later!</div>
               ) : (
                 tests.map((test) => (
                   <div key={test.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
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

          {/* --- OTHER TABS --- */}
          {(activeTab === "STORE" || activeTab === "CONTACT US") && (
            <div className="text-center mt-20 text-gray-400">Coming Soon</div>
          )}

        </div>
      </main>
    </div>
  );
}

// --- ICONS ---
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
