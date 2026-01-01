"use client";
import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
// PASTE YOUR RENDER URL HERE (Keep the /api/courses part)
const API_URL = "https://deducia-backend.onrender.com/api/courses"; 

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data from your "Brain" (Backend)
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR (Left Panel) */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6 text-2xl font-bold text-blue-600">Deducia</div>
        <nav className="mt-6">
          <a href="#" className="flex items-center px-6 py-3 bg-blue-50 text-blue-700 border-r-4 border-blue-700">
            <span>📚 My Batches</span>
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50">
            <span>📝 Test Series</span>
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50">
            <span>📊 Results</span>
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT (Center) */}
      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">My Batches</h1>
          <div className="h-8 w-8 bg-blue-600 rounded-full text-white flex items-center justify-center">
            S
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-8">
          {loading ? (
            <p>Loading your courses...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Loop through the courses from the database */}
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                  {/* Thumbnail */}
                  <div className="h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={course.thumbnail_url || "https://placehold.co/600x400"} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}