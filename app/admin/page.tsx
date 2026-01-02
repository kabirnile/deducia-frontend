"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function AdminPanel() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  
  // --- FORM STATE ---
  const [form, setForm] = useState({
    title: "", description: "", thumbnail_url: "", video_url: "", notes_url: ""
  });
  const [status, setStatus] = useState("");

  // --- 1. SECURITY CHECK ON LOAD ---
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    if (!storedAdmin) {
      router.push('/admin/login'); // Kick out if not logged in
    } else {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Uploading...");

    // Add Teacher ID to the data
    const payload = { ...form, teacher_id: admin.id };

    const res = await fetch(`${API_BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      setStatus("✅ Success! Course Created.");
      setForm({ title: "", description: "", thumbnail_url: "", video_url: "", notes_url: "" }); 
    } else {
      setStatus("❌ Error: " + data.error);
    }
  };

  if (!admin) return null; // Don't show anything until check is done

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Deducia <span className="text-blue-600">Admin</span></h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, <b>{admin.full_name}</b></span>
          <button 
            onClick={() => { localStorage.removeItem('adminUser'); router.push('/admin/login'); }}
            className="text-red-500 text-sm font-bold hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-10 max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload New Content 📤</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" placeholder="e.g. Thermodynamics - Lecture 1" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border p-2 rounded h-20 focus:ring-2 ring-blue-500 outline-none" placeholder="Details about the lecture..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Thumbnail URL</label>
                 <input name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="https://..." />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Notes PDF URL</label>
                 <input name="notes_url" value={form.notes_url} onChange={handleChange} className="w-full border p-2 rounded" placeholder="https://..." />
               </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">YouTube Embed Link</label>
              <input name="video_url" value={form.video_url} onChange={handleChange} className="w-full border p-2 rounded font-mono text-sm" placeholder="https://www.youtube.com/embed/..." />
            </div>

            <button type="submit" className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 font-bold shadow-lg">
              🚀 Publish to My Students
            </button>

            {status && <p className="text-center font-bold mt-4 animate-pulse">{status}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
