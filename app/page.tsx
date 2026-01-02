"use client";
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function Home() {
  const [user, setUser] = useState<any>(null);
  
  // Login States
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data States
  const [allCourses, setAllCourses] = useState<any[]>([]); 
  const [myCourses, setMyCourses] = useState<any[]>([]); // PERSONALIZED
  const [tests, setTests] = useState<any[]>([]); 
  const [myScores, setMyScores] = useState<any[]>([]);   // PERSONALIZED

  const [activeTab, setActiveTab] = useState("STUDY"); // Default to My Study

  // --- AUTO-LOGIN ---
  useEffect(() => {
    const savedUser = localStorage.getItem('studentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserData(parsedUser.id);
    }
  }, []);

  // --- FETCH ALL DATA ---
  const loadUserData = (userId: number) => {
    // 1. Get All Courses (For Explore)
    fetch(`${API_BASE}/api/courses`).then(res=>res.json()).then(data => setAllCourses(Array.isArray(data)?data:[]));
    
    // 2. Get All Tests
    fetch(`${API_BASE}/api/tests`).then(res=>res.json()).then(data => setTests(Array.isArray(data)?data:[]));

    // 3. Get MY Batches (Personal)
    fetch(`${API_BASE}/api/my-batches?student_id=${userId}`)
        .then(res=>res.json())
        .then(data => setMyCourses(Array.isArray(data)?data:[]));

    // 4. Get MY Scores (Personal)
    fetch(`${API_BASE}/api/my-results?student_id=${userId}`)
        .then(res=>res.json())
        .then(data => setMyScores(Array.isArray(data)?data:[]));
  };

  // --- AUTH LOGIC (Same as before) ---
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

  // --- ENROLL LOGIC ---
  const handleEnroll = async (courseId: number) => {
    if(!confirm("Join this batch for free?")) return;
    await fetch(`${API_BASE}/api/enroll`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ student_id: user.id, course_id: courseId })
    });
    alert("Batch Joined! Check 'Study' tab.");
    loadUserData(user.id); // Refresh lists
  };

  const handleLogout = () => {
    localStorage.removeItem('studentUser');
    setUser(null);
  };

  // --- LOGIN UI ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-6">{isNewUser ? "Create Profile" : "Login"}</h1>
            <form onSubmit={handleAuth} className="space-y-4">
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile Number" className="w-full border p-3 rounded" />
                {isNewUser && <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full Name" className="w-full border p-3 rounded" />}
                <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-3 rounded font-bold">{loading?"Processing...":"Continue"}</button>
                {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD UI ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <span className="text-2xl font-bold">Deducia.</span>
        </div>
        <nav className="p-4 space-y-1">
            <div className="text-xs font-bold text-gray-400 px-3 mt-2">MY ZONE</div>
            <SidebarItem label="My Study" icon="📚" active={activeTab==="STUDY"} onClick={()=>setActiveTab("STUDY")} />
            <SidebarItem label="Test Performance" icon="📊" active={activeTab==="PERFORMANCE"} onClick={()=>setActiveTab("PERFORMANCE")} />
            
            <div className="text-xs font-bold text-gray-400 px-3 mt-6">EXPLORE</div>
            <SidebarItem label="All Batches" icon="🌍" active={activeTab==="BATCHES"} onClick={()=>setActiveTab("BATCHES")} />
            <SidebarItem label="Test Series" icon="📝" active={activeTab==="TEST SERIES"} onClick={()=>setActiveTab("TEST SERIES")} />
        </nav>
        <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">{user.full_name[0]}</div>
                <div>
                    <p className="text-sm font-bold">{user.full_name}</p>
                    <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Logout</button>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">{activeTab === "STUDY" ? `👋 Hi ${user.full_name}, Let's Study!` : activeTab}</h1>

        {/* --- TAB: MY STUDY (Enrolled Batches) --- */}
        {activeTab === "STUDY" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed">
                        <p className="text-xl text-gray-400">You haven't joined any batches yet.</p>
                        <button onClick={()=>setActiveTab("BATCHES")} className="mt-4 text-purple-600 font-bold hover:underline">Explore Batches →</button>
                    </div>
                ) : myCourses.map(course => (
                    <CourseCard key={course.id} course={course} isEnrolled={true} />
                ))}
            </div>
        )}

        {/* --- TAB: ALL BATCHES (Explore) --- */}
        {activeTab === "BATCHES" && (
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

        {/* --- TAB: TEST SERIES (Take Tests) --- */}
        {activeTab === "TEST SERIES" && (
            <div className="space-y-4">
                {tests.map(test => {
                    const myScore = myScores.find(s => s.test_id === test.id);
                    return (
                        <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{test.title}</h3>
                                <p className="text-gray-500 text-sm">{test.duration_minutes} Mins</p>
                            </div>
                            {myScore ? (
                                <div className="text-right">
                                    <span className="block text-sm text-gray-500">Your Score</span>
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

         {/* --- TAB: PERFORMANCE (Stats) --- */}
         {activeTab === "PERFORMANCE" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-gray-500 font-bold text-xs uppercase">Tests Taken</h3>
                    <p className="text-4xl font-extrabold text-blue-600 mt-2">{myScores.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-gray-500 font-bold text-xs uppercase">Batches Joined</h3>
                    <p className="text-4xl font-extrabold text-purple-600 mt-2">{myCourses.length}</p>
                </div>
            </div>
         )}

      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function SidebarItem({ label, icon, active, onClick }: any) {
    return (
        <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded cursor-pointer ${active ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <span>{icon}</span>
            <span>{label}</span>
        </div>
    );
}

function CourseCard({ course, isEnrolled }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <img src={course.thumbnail_url} className="h-40 object-cover bg-gray-200" />
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <div className="mt-auto">
                    <a href={`/course/${course.id}`} className="block w-full text-center bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                        {isEnrolled ? "Resume Learning ▶" : "View Details"}
                    </a>
                </div>
            </div>
        </div>
    );
}
