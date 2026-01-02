"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function CreateTest() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Test Info, Step 2: Add Questions
  const [testId, setTestId] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  // Form 1: Test Details
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);

  // Form 2: Question Details
  const [qForm, setQForm] = useState({
    text: "", a: "", b: "", c: "", d: "", correct: "A"
  });
  const [questionsAdded, setQuestionsAdded] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('adminUser'));
    if (user) setTeacherId(user.id);
  }, []);

  // --- STEP 1: CREATE TEST SHELL ---
  const createTest = async () => {
    const res = await fetch(`${API_BASE}/api/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, duration_minutes: duration, teacher_id: teacherId }),
    });
    const data = await res.json();
    if (data.success) {
      setTestId(data.id);
      setStep(2); // Move to Question Adding mode
    }
  };

  // --- STEP 2: ADD QUESTION ---
  const addQuestion = async () => {
    await fetch(`${API_BASE}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test_id: testId,
        question_text: qForm.text,
        option_a: qForm.a, option_b: qForm.b, option_c: qForm.c, option_d: qForm.d,
        correct_option: qForm.correct
      }),
    });
    setQuestionsAdded(prev => prev + 1);
    setQForm({ text: "", a: "", b: "", c: "", d: "", correct: "A" }); // Clear form
    alert("Question Added!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        
        {step === 1 ? (
          // --- VIEW 1: TEST SETUP ---
          <>
            <h1 className="text-2xl font-bold mb-6">Create New Test 📝</h1>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Test Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. History Mock Test 1" />
              </div>
              <div>
                <label className="block font-bold mb-1">Duration (Minutes)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <button onClick={createTest} className="w-full bg-blue-600 text-white py-3 rounded font-bold">Start Adding Questions 👉</button>
            </div>
          </>
        ) : (
          // --- VIEW 2: ADD QUESTIONS ---
          <>
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-xl font-bold">Add Question #{questionsAdded + 1}</h1>
               <button onClick={() => router.push('/admin')} className="text-sm text-red-500 font-bold">Finish & Exit</button>
            </div>
            
            <div className="space-y-4">
              <textarea 
                value={qForm.text} 
                onChange={e => setQForm({...qForm, text: e.target.value})} 
                className="w-full border p-2 rounded h-24" 
                placeholder="Type question here..." 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Option A" value={qForm.a} onChange={e => setQForm({...qForm, a: e.target.value})} className="border p-2 rounded" />
                <input placeholder="Option B" value={qForm.b} onChange={e => setQForm({...qForm, b: e.target.value})} className="border p-2 rounded" />
                <input placeholder="Option C" value={qForm.c} onChange={e => setQForm({...qForm, c: e.target.value})} className="border p-2 rounded" />
                <input placeholder="Option D" value={qForm.d} onChange={e => setQForm({...qForm, d: e.target.value})} className="border p-2 rounded" />
              </div>

              <div>
                <label className="block font-bold mb-1">Correct Answer</label>
                <select value={qForm.correct} onChange={e => setQForm({...qForm, correct: e.target.value})} className="w-full border p-2 rounded">
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <button onClick={addQuestion} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">
                ➕ Save Question
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
