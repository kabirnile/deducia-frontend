"use client";
import { useState } from 'react';

// Environment Variable Logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function AdminPanel() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    video_url: "",
    notes_url: ""
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Uploading...");

    const res = await fetch(`${API_BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      setStatus("✅ Success! Course Created.");
      setForm({ title: "", description: "", thumbnail_url: "", video_url: "", notes_url: "" }); // Reset form
    } else {
      setStatus("❌ Error: " + data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Command Center 🛠️</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block font-medium text-gray-700">Course Title</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. UPSC Prelims 2027" className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Short summary..." className="w-full border p-2 rounded h-24"></textarea>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Thumbnail Image URL</label>
            <input name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} required placeholder="https://..." className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block font-medium text-gray-700">YouTube Embed Link</label>
            <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." className="w-full border p-2 rounded" />
            <p className="text-xs text-gray-400 mt-1">Make sure to use the 'embed' link, not 'watch'.</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700">PDF Notes URL</label>
            <input name="notes_url" value={form.notes_url} onChange={handleChange} placeholder="https://..." className="w-full border p-2 rounded" />
          </div>

          <button type="submit" className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 font-bold">
            🚀 Launch Course
          </button>

          {status && <p className="text-center font-bold mt-4">{status}</p>}
        </form>
      </div>
    </div>
  );
}
