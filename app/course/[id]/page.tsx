"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Use your Vercel Environment Variable logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function Classroom() {
  const params = useParams(); // Get the Course ID from the URL
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch the specific course details
    // (We reuse the all-courses API for simplicity in this MVP)
    fetch(`${API_BASE}/api/courses`)
      .then((res) => res.json())
      .then((data) => {
        // Find the course that matches the ID in the URL
        const found = data.find(c => c.id.toString() === params.id);
        if (found) {
          setCourse(found);
        }
        setLoading(false);
      })
      .catch((err) => console.error("Error:", err));
  }, [params.id]);

  if (loading) return <div className="p-10 text-center">Loading your classroom...</div>;
  if (!course) return <div className="p-10 text-center text-red-500">Course not found.</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      
      {/* HEADER */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-blue-600">
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-800">{course.title}</h1>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* VIDEO PLAYER */}
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video">
            {course.video_url ? (
              <iframe 
                src={course.video_url} 
                className="w-full h-full" 
                title="Course Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No video uploaded for this class yet.
              </div>
            )}
          </div>

          {/* TABS / INFO */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Class Notes & Details</h2>
            <p className="text-gray-600 mb-6">{course.description}</p>
            
            <div className="flex gap-4">
              {/* SMART NOTES BUTTON */}
{course.notes_url ? (
  <a 
    href={course.notes_url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="px-4 py-2 bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 flex items-center gap-2"
  >
    📄 Download PDF Notes
  </a>
) : (
  <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
    🚫 No Notes Available
  </button>
)}
               <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200">
                 💬 Ask a Doubt
               </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
