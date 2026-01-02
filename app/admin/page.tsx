"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function AdminPanel() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [myCourses, setMyCourses] = useState([]); // Store teacher's courses
  
  // Form State
  const [form, setForm] = useState({
    title: "", description: "", thumbnail_url: "", video_url: "", notes_url: ""
  });
  const [status, setStatus] = useState("");

  // 1. SECURITY CHECK & DATA FETCH
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    if (!storedAdmin) {
      router.push('/admin/login');
    } else {
      const user = JSON.parse(storedAdmin);
      setAdmin(user);
      fetchMyCourses(user.id); // Fetch ONLY this teacher's courses
    }
  }, []);

  const fetchMyCourses = (teacherId) => {
    fetch(`${API_BASE}/api/courses?teacher_id=${teacherId}`)
      .then(res => res.json())
      .then(data => setMyCourses(data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Uploading...");

    const payload = { ...form, teacher_id: admin.id };

    const res = await fetch(`${API_BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      setStatus("✅ Success!");
      setForm({ title: "", description: "", thumbnail_url: "", video_url: "", notes_url: "" }); 
      fetchMyCourses(admin.id); // Refresh the list immediately
    } else {
      setStatus("❌ Error: " + data.error);
    }
  };

  const handleDelete = async (courseId) => {
    if(!confirm("Are you sure you want to delete this batch?")) return;
    
    await fetch(`${API_BASE}/api/courses/${courseId}`, { method: 'DELETE' });
    fetchMyCourses(admin.id); // Refresh list
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Top Bar */}
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center sticky top-0 z-10">
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

      <div className="p-6 md:p-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: UPLOAD FORM */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload New Content 📤</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" placeholder="e.g. Thermodynamics - Lecture 1" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border p-2 rounded h-20 focus:ring-2 ring-blue-500 outline-none"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <input name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Thumbnail URL" />
               <input name="notes_url" value={form.notes_url} onChange={handleChange} className="w-full border p-2 rounded" placeholder="PDF URL" />
            </div>
            <input name="video_url" value={form.video_url} onChange={handleChange} className="w-full border p-2 rounded font-mono text-sm" placeholder="YouTube Embed Link" />
            
            <button type="submit" className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 font-bold shadow-lg">
              🚀 Publish
            </button>
            {status && <p className="text-center font-bold mt-4 text-green-600">{status}</p>}
          </form>
        </div>

        {/* RIGHT COLUMN: MY BATCHES LIST */}
        <div>
           <h2 className="text-2xl font-bold text-gray-800 mb-6">My Batches ({myCourses.length}) 📚</h2>
           <div className="space-y-4">
             {myCourses.length === 0 ? (
               <div className="text-gray-400 text-center py-10 bg-white rounded-xl border border-dashed">No batches found. Upload one!</div>
             ) : (
               myCourses.map((course) => (
                 <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center group hover:shadow-md transition">
                   <img src={course.thumbnail_url} className="w-20 h-14 object-cover rounded bg-gray-200" />
                   <div className="flex-1">
                     <h3 className="font-bold text-gray-800 line-clamp-1">{course.title}</h3>
                     <p className="text-xs text-gray-500 line-clamp-1">{course.description}</p>
                   </div>
                   <button 
                     onClick={() => handleDelete(course.id)}
                     className="text-gray-300 hover:text-red-500 p-2 transition"
                     title="Delete Batch"
                   >
                     🗑️
                   </button>
                 </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
