"use client";
import { useState, useEffect } from 'react';

// Environment Variable Logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function Home() {
  const [user, setUser] = useState<any>(null);
  
  // Auth State
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
  
  // Feature Forms States
  const [mentorForm, setMentorForm] = useState({ subject: 'Physics', issue: '', time: 'Morning' });
  const [contactForm, setContactForm] = useState({ msg: '' });
  const [formStatus, setFormStatus] = useState("");

  // AI Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: 'ai', text: 'Hello! I am Deducia AI. Ask me about courses, fees, physics, or chemistry!' }
  ]);

  const [activeTab, setActiveTab] = useState("HOME"); 

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

  // --- AUTH & ENROLL (Same as before) ---
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

  const handleLogout = () => { localStorage.removeItem('studentUser'); setUser(null); };

  // --- NEW: MENTOR REQUEST HANDLER ---
  const submitMentorRequest = async (e: any) => {
    e.preventDefault();
    setFormStatus("Sending...");
    await fetch(`${API_BASE}/api/mentor-request`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ student_id: user.id, subject: mentorForm.subject, issue: mentorForm.issue, preferred_time: mentorForm.time })
    });
    setFormStatus("✅ Request Sent! A mentor will call you.");
    setMentorForm({ subject: 'Physics', issue: '', time: 'Morning' });
  };

  // --- NEW: CONTACT MESSAGE HANDLER ---
  const submitContact = async (e: any) => {
    e.preventDefault();
    setFormStatus("Sending...");
    await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: user.full_name, phone: user.phone, message: contactForm.msg })
    });
    setFormStatus("✅ Message Received. Ticket Created.");
    setContactForm({ msg: '' });
  };

  // --- NEW: SMART AI BOT 🧠 ---
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.toLowerCase();
    
    // Add User Message
    const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");

    // AI BRAIN (Simple Rule-Based)
    let reply = "I am not sure about that. Try asking about 'Physics', 'Batches', or 'Tests'.";
    
    if (userMsg.includes('hello') || userMsg.includes('hi')) reply = "Hello! How can I help you study today?";
    else if (userMsg.includes('physics')) reply = "For Physics, I recommend starting with 'Rotational Motion' in the library. It is high weightage.";
    else if (userMsg.includes('price') || userMsg.includes('cost') || userMsg.includes('fee')) reply = "Good news! All batches are currently 50% OFF for the Year End Sale.";
    else if (userMsg.includes('test') || userMsg.includes('exam')) reply = "You can attempt the 'UPSC Mock Test 1' in the Test Series tab. It is live now.";
    else if (userMsg.includes('chemistry')) reply = "Organic Chemistry notes have been updated in Chapter 4. Check the Library.";

    // Simulate Typing Delay
    setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
    }, 600);
  };

  // --- LOGIN UI ---
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

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10 overflow-y-auto">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0 sticky top-0 bg-white">
          <span className="text-2xl font-bold">Deducia<span className="text-purple-600">.</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem label="Dashboard" icon="🏠" active={activeTab==="HOME"} onClick={()=>setActiveTab("HOME")} />
          <SidebarItem label="My Batches" icon="🎓" active={activeTab==="MY_BATCHES"} onClick={()=>setActiveTab("MY_BATCHES")} />
          <SidebarItem label="Khazana" icon="💎" active={activeTab==="KHAZANA"} onClick={()=>setActiveTab("KHAZANA")} isNew={true} />
          
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">ASSISTANCE</div>
          <SidebarItem label="Ask AI" icon="🤖" active={activeTab==="AI_CHAT"} onClick={()=>setActiveTab("AI_CHAT")} />
          <SidebarItem label="My Mentor" icon="👨‍🏫" active={activeTab==="MENTOR"} onClick={()=>setActiveTab("MENTOR")} />

          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">PRACTICE</div>
          <SidebarItem label="Test Series" icon="📝" active={activeTab==="TESTS"} onClick={()=>setActiveTab("TESTS")} />
          
          <div className="text-xs font-bold text-gray-400 px-3 mt-6 mb-2">EXPLORE</div>
          <SidebarItem label="All Batches" icon="🌍" active={activeTab==="ALL_BATCHES"} onClick={()=>setActiveTab("ALL_BATCHES")} />

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

      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
            <h2 className="text-lg font-bold">{activeTab.replace('_', ' ')}</h2>
            <div className="flex items-center gap-4"><span className="text-2xl cursor-pointer">🔔</span></div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
            {/* === HOME === */}
            {activeTab === "HOME" && (
                <div className="space-y-8">
                    <h1 className="text-3xl font-bold text-gray-900">Hi, {user.full_name} 👋</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard label="Batches Joined" value={myCourses.length} color="bg-blue-100 text-blue-700" />
                        <StatCard label="Tests Attempted" value={myScores.length} color="bg-green-100 text-green-700" />
                        <StatCard label="Mentorship" value="Active" color="bg-orange-100 text-orange-700" />
                    </div>
                </div>
            )}

            {/* === MENTOR FORM (FUNCTIONAL) === */}
            {activeTab === "MENTOR" && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
                    <h2 className="text-2xl font-bold mb-6">Request a Mentor Session 👨‍🏫</h2>
                    <form onSubmit={submitMentorRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Subject</label>
                            <select value={mentorForm.subject} onChange={e=>setMentorForm({...mentorForm, subject: e.target.value})} className="w-full border p-3 rounded">
                                <option>Physics</option><option>Chemistry</option><option>Maths</option><option>Biology</option><option>General Strategy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Preferred Time</label>
                            <select value={mentorForm.time} onChange={e=>setMentorForm({...mentorForm, time: e.target.value})} className="w-full border p-3 rounded">
                                <option>Morning (10AM - 12PM)</option><option>Afternoon (2PM - 5PM)</option><option>Evening (6PM - 9PM)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">What are you struggling with?</label>
                            <textarea value={mentorForm.issue} onChange={e=>setMentorForm({...mentorForm, issue: e.target.value})} required className="w-full border p-3 rounded h-32" placeholder="e.g. I cannot solve rotational motion problems..."></textarea>
                        </div>
                        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded hover:bg-orange-600">Request Call Back</button>
                        {formStatus && <p className="text-center font-bold text-green-600 animate-pulse">{formStatus}</p>}
                    </form>
                </div>
            )}

            {/* === CONTACT FORM (FUNCTIONAL) === */}
            {activeTab === "CONTACT" && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
                    <h2 className="text-2xl font-bold mb-6">Contact Support 📞</h2>
                    <form onSubmit={submitContact} className="space-y-4">
                        <div className="bg-gray-100 p-4 rounded text-sm text-gray-600">
                            You are contacting us as <b>{user.full_name}</b> ({user.phone}). We will reply to this number.
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Message</label>
                            <textarea value={contactForm.msg} onChange={e=>setContactForm({...contactForm, msg: e.target.value})} required className="w-full border p-3 rounded h-32" placeholder="How can we help you?"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700">Send Message</button>
                        {formStatus && <p className="text-center font-bold text-green-600 animate-pulse">{formStatus}</p>}
                    </form>
                </div>
            )}

            {/* === AI CHAT (SMARTER) === */}
           // --- REAL GEMINI CHAT LOGIC ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // 1. Add User Message to UI immediately
    const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
    setChatHistory(newHistory);
    const userMessage = chatInput;
    setChatInput(""); // Clear input box

    // 2. Add a temporary "Thinking..." bubble
    const loadingHistory = [...newHistory, { role: 'ai', text: "Thinking..." }];
    setChatHistory(loadingHistory);

    try {
      // 3. Call OUR Backend API (not Google directly)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      // 4. Replace "Thinking..." with Real Answer
      setChatHistory(prev => [
        ...prev.slice(0, -1), // Remove the last "Thinking..." message
        { role: 'ai', text: data.reply }
      ]);

    } catch (error) {
      // Handle Error
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', text: "Sorry, I am having trouble connecting to the server." }
      ]);
    }
  };
            
            )}

             {/* === OTHER TABS (Same as before) === */}
            {activeTab === "MY_BATCHES" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.length === 0 ? <EmptyState msg="No batches yet. Go to 'All Batches' to join one!" /> : myCourses.map(course => <CourseCard key={course.id} course={course} isEnrolled={true} />)}
                </div>
            )}
            {activeTab === "ALL_BATCHES" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
                            <img src={course.thumbnail_url} className="h-40 object-cover bg-gray-200" />
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                <div className="mt-auto">
                                    {myCourses.some(c => c.id === course.id) ? 
                                        <button disabled className="w-full bg-green-100 text-green-700 py-2 rounded font-bold">✅ Joined</button> : 
                                        <button onClick={()=>handleEnroll(course.id)} className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">Join Batch</button>
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === "TESTS" && (
                <div className="space-y-4">
                    {tests.map(test => (
                        <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                            <div><h3 className="font-bold text-lg">{test.title}</h3><p className="text-gray-500 text-sm">{test.duration_minutes} Mins</p></div>
                            <a href={`/test/${test.id}`} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Attempt</a>
                        </div>
                    ))}
                </div>
            )}
             {activeTab === "ABOUT" && <div className="bg-white p-10 rounded-xl shadow-sm max-w-4xl mx-auto"><h1 className="text-3xl font-bold mb-4">About Deducia</h1><p>Deducia is India's most affordable learning platform.</p></div>}
             {activeTab === "PRIVACY" && <div className="bg-white p-10 rounded-xl shadow-sm max-w-4xl mx-auto"><h1 className="text-3xl font-bold mb-4">Privacy Policy</h1><p>We respect your data privacy.</p></div>}
             {activeTab === "KHAZANA" && <div className="text-center py-20"><div className="text-6xl mb-4">💎</div><h2 className="text-2xl font-bold">Khazana</h2><p className="text-gray-500">Coming Soon.</p></div>}

        </div>
      </main>
    </div>
  );
}

function SidebarItem({ label, icon, active, onClick, isNew }: any) {
    return (
        <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition select-none ${active ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <span>{icon}</span><span className="flex-1">{label}</span>{isNew && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">NEW</span>}
        </div>
    );
}
function StatCard({ label, value, color }: any) {
    return (
        <div className={`p-6 rounded-xl border ${color.replace('text-', 'border-').replace('100', '200')} bg-white`}>
            <h3 className="text-gray-500 font-bold text-xs uppercase">{label}</h3><p className={`text-3xl font-extrabold mt-2 ${color.split(' ')[1]}`}>{value}</p>
        </div>
    );
}
function CourseCard({ course, isEnrolled }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition">
            <div className="h-40 bg-gray-200 relative"><img src={course.thumbnail_url} className="w-full h-full object-cover" /></div>
            <div className="p-4 flex-1 flex flex-col"><h3 className="font-bold text-lg mb-1">{course.title}</h3><div className="mt-auto"><a href={`/course/${course.id}`} className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">{isEnrolled ? "Resume ▶" : "View"}</a></div></div>
        </div>
    );
}
function EmptyState({ msg }: any) { return <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed"><p className="text-xl text-gray-400">{msg}</p></div>; }
