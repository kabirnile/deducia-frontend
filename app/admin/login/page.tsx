"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Environment Variable Logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 1. Call the Login API
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    // 2. Security Check: Is this user an ADMIN?
    if (data.success) {
      if (data.user.role === 'admin') {
        // Save Admin info to LocalStorage so we remember them
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        router.push('/admin'); // Send to Dashboard
      } else {
        setError("🚫 Access Denied. You are not a Teacher.");
      }
    } else {
      setError("❌ User not found.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Teacher Portal 🎓</h1>
        <p className="text-gray-500 text-center mb-8">Login to manage your content</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Teacher Mobile Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter registered number" 
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 outline-none transition"
            />
          </div>

          {error && <p className="text-red-500 text-center font-bold bg-red-50 p-2 rounded">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-105">
            Secure Login 🔒
          </button>
        </form>
      </div>
    </div>
  );
}
