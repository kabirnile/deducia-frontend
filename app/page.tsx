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
  
  // Chat State (For AI)
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'ai', text: 'Hello! I am your AI Study Assistant. Ask me any doubt from Physics, Chemistry, or Maths!' }
  ]);

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

  // --- 3. AI CHAT LOGIC ---
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add User Message
    const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");

    // Simulate AI Response (Fake for now)
    setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "That is a great question! While I am in beta mode, please refer to the Lecture Notes in Chapter 4 for a detailed explanation. 🤖" }]);
    }, 1000);
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
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10 overflow-y-auto">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0 sticky top-0 bg-white">
          <span className="text-2xl font-bold">Deducia<span className="text-purple-600">.</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {/* Main Learning */}
          <SidebarItem label="Dashboard" icon="🏠" active={activeTab==="HOME"} onClick={()=>setActiveTab("HOME")} />
          <SidebarItem label="My Batches" icon="🎓" active={activeTab==="MY_BATCHES"} onClick={()=>setActiveTab("MY_BATCHES")} />
          <SidebarItem label="Khazana" icon="💎" active={activeTab==="KHAZANA"} onClick={()=>setActiveTab("KHAZANA")} isNew={true} />
          
          {/* AI & Mentorship */}
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">ASSISTANCE</div>
          <SidebarItem label="Ask AI" icon="🤖" active={activeTab==="AI_CHAT"} onClick={()=>setActiveTab("AI_CHAT")} />
          <SidebarItem label="My Mentor" icon="👨‍🏫" active={activeTab==="MENTOR"} onClick={()=>setActiveTab("MENTOR")} />

          {/* Practice */}
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">PRACTICE</div>
          <SidebarItem label="Test Series" icon="📝" active={activeTab==="TESTS"} onClick={()=>setActiveTab("TESTS")} />
          <SidebarItem label="Library" icon="📚" active={activeTab==="LIBRARY"} onClick={()=>setActiveTab("LIBRARY")} />

          {/* Explore */}
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">EXPLORE</div>
          <SidebarItem label="All Batches" icon="🌍" active={activeTab==="ALL_BATCHES"} onClick={()=>setActiveTab("ALL_BATCHES")} />
          <SidebarItem label="PW Centers" icon="🏢" active={activeTab==="CENTERS"} onClick={()=>setActiveTab("CENTERS")} />

          {/* Company */}
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">GENERAL</div>
          <SidebarItem label="About Us" icon="ℹ️" active={activeTab==="ABOUT"} onClick={()=>setActiveTab("ABOUT")} />
          <SidebarItem label="Contact Us" icon="📞" active={activeTab==="CONTACT"} onClick={()=>setActiveTab("CONTACT")} />
          <SidebarItem label="Privacy Policy" icon="🔒" active={activeTab==="PRIVACY"} onClick={()=>setActiveTab("PRIVACY")} />
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
            </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">

            {/* === 1. DASHBOARD HOME === */}
            {activeTab === "HOME" && (
                <div className="space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Hi, {user.full_name} 👋</h1>
                            <p className="text-gray-500">Let's continue your preparation for UPSC 2027</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard label="Batches Joined" value={myCourses.length} color="bg-blue-100 text-blue-700" />
                        <StatCard label="Tests Attempted" value={myScores.length} color="bg-green-100 text-green-700" />
                        <StatCard label="Mentorship" value="Active" color="bg-orange-100 text-orange-700" />
                        <StatCard label="AI Credits" value="Free" color="bg-purple-100 text-purple-700" />
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">📅 Today's Schedule</h3>
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                            No live classes scheduled for today.
                        </div>
                    </div>
                </div>
            )}

            {/* === 2. AI ASK ANYTHING === */}
            {activeTab === "AI_CHAT" && (
                <div className="bg-white rounded-xl shadow-lg border flex flex-col h-[80vh] overflow-hidden">
                    <div className="bg-purple-600 text-white p-4 font-bold flex justify-between">
                        <span>🤖 Deducia AI</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">BETA</span>
                    </div>
                    
                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t flex gap-2">
                        <input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your doubt here..." 
                            className="flex-1 border p-3 rounded-full focus:ring-2 ring-purple-500 outline-none" 
                        />
                        <button onClick={handleSendMessage} className="bg-purple-600 text-white w-12 h-12 rounded-full font-bold hover:bg-purple-700">➤</button>
                    </div>
                </div>
            )}

            {/* === 3. MY MENTOR === */}
            {activeTab === "MENTOR" && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-2xl shadow-lg mb-8">
                        <h2 className="text-3xl font-bold mb-2">Saarthi Mentorship Program</h2>
                        <p className="opacity-90">Get 1-on-1 guidance from UPSC Rank Holders.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                            <img src="https://placehold.co/200x200" alt="Mentor" />
                        </div>
                        <h3 className="text-xl font-bold">Assigning Mentor...</h3>
                        <p className="text-gray-500 mb-6">We are matching you with the best mentor based on your profile.</p>
                        <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600">Request Call Back</button>
                    </div>
                </div>
            )}

            {/* === 4. MY BATCHES === */}
            {activeTab === "MY_BATCHES" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.length === 0 ? <EmptyState msg="No batches yet. Go to 'All Batches' to join one!" /> : 
                     myCourses.map(course => <CourseCard key={course.id} course={course} isEnrolled={true} />)}
                </div>
            )}

            {/* === 5. KHAZANA === */}
            {activeTab === "KHAZANA" && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">💎</div>
                    <h2 className="text-2xl font-bold">Welcome to Khazana</h2>
                    <p className="text-gray-500 max-w-md mx-auto mt-2">Premium content unlocking soon.</p>
                </div>
            )}

            {/* === 6. ALL BATCHES === */}
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

            {/* === 7. TEST SERIES === */}
            {activeTab === "TESTS" && (
                <div className="space-y-4">
                    {tests.map(test => {
                        const myScore = myScores.find(s => s.test_id === test.id);
                        return (
                            <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
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

            {/* === 8. GENERAL PAGES (About, Contact, Privacy) === */}
            {activeTab === "ABOUT" && (
                <div className="bg-white p-10 rounded-xl shadow-sm max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">About Deducia</h1>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Deducia is India's most affordable learning platform for UPSC & JEE aspirants. 
                        We believe that quality education should be accessible to everyone, regardless of their financial background.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Founded in 2025, we have helped over 10,000+ students achieve their dreams.
                    </p>
                </div>
            )}

            {activeTab === "CONTACT" && (
                <div className="bg-white p-10 rounded-xl shadow-sm max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-2">📍 Head Office</h3>
                            <p className="text-gray-600">Plot No. 12, Tech Park, Aligarh, Uttar Pradesh, India - 202001</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">📞 Support</h3>
                            <p className="text-gray-600">Email: support@deducia.com</p>
                            <p className="text-gray-600">Phone: +91 99999 88888</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "PRIVACY" && (
                <div className="bg-white p-10 rounded-xl shadow-sm max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-gray-600 text-sm mb-4">Last Updated: Jan 2026</p>
                    <div className="space-y-4 text-gray-700">
                        <p>1. <strong>Data Collection:</strong> We collect your phone number and name solely for authentication and personalization purposes.</p>
                        <p>2. <strong>Data Usage:</strong> We do not sell your data to third parties.</p>
                        <p>3. <strong>Security:</strong> All your test scores and learning progress are stored securely.</p>
                    </div>
                </div>
            )}

            {/* === 9. UNDER CONSTRUCTION === */}
            {(activeTab === "LIBRARY" || activeTab === "CENTERS") && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">🚧 Feature Under Construction</p>
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
