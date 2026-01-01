"use client";
import { useState, useEffect } from 'react';

// Use the Environment Variable you set in Vercel
// If it fails, it falls back to empty string (which handles errors gracefully)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function Home() {
  const [user, setUser] = useState(null); // Stores the logged-in student
  const [phone, setPhone] = useState(""); // Stores what they type
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. FUNCTION: Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Connect to your Backend Login API
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user); // Login Success! Save user.
        fetchCourses();     // Immediately load their courses.
      } else {
        setError(data.message || "Login failed"); // Show error message
      }
    } catch (err) {
      setError("Connection error. Is Backend running?");
    }
    setLoading(false);
  };

  // 2. FUNCTION: Fetch Courses (Only called after login)
  const fetchCourses = () => {
    fetch(`${API_BASE}/api/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Error courses:", err));
  };

  // --- VIEW 1: LOGIN SCREEN (If no user) ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-700">Deducia</h1>
            <p className="text-gray-500">Student Login Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                type="text" 
                placeholder="Enter registered phone (e.g. 9876543210)" 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
            >
              {loading ? "Checking..." : "Login Securely"}
            </button>
          </form>
          
          <div className="mt-4 text-center text-xs text-gray-400">
            Protected by Deducia Secure Systems
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD (If user is logged in) ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6 text-2xl font-bold text-blue-600">Deducia</div>
        <div className="px-6 mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase">Student</div>
          <div className="text-sm font-medium text-gray-700">{user.full_name || "Student"}</div>
        </div>
        <nav>
          <a href="#" className="flex items-center px-6 py-3 bg-blue-50 text-blue-700 border-r-4 border-blue-700">
            <span>📚 My Batches</span>
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">My Batches</h1>
          <button onClick={() => setUser(null)} className="text-sm text-red-600 hover:text-red-800">
            Logout
          </button>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? <p>Loading courses...</p> : courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover"/>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{course.title}</h3>
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Start Learning</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
