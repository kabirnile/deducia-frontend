"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Environment Variable Logic
const API_BASE = process.env.NEXT_PUBLIC_API_URL ? 
    process.env.NEXT_PUBLIC_API_URL.replace('/api/courses', '') : 
    ""; 

export default function ExamRoom() {
  const params = useParams(); // Get the Test ID from URL
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0); // Which question are we on?
  const [answers, setAnswers] = useState<any>({}); // Store student answers { 1: 'A', 2: 'C' }
  const [timeLeft, setTimeLeft] = useState(3600); // Default 60 mins (in seconds)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // 1. Fetch Questions when page loads
  useEffect(() => {
    if (params?.id) {
      fetch(`${API_BASE}/api/tests/${params.id}/questions`)
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) setQuestions(data);
        })
        .catch(err => console.error(err));
    }
  }, [params]);

  // 2. Timer Logic
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  // 3. Handle Answer Selection
  const handleSelect = (option: string) => {
    if (isSubmitted) return; // Freeze if submitted
    setAnswers({ ...answers, [currentQ]: option });
  };

  // 4. Submit & Calculate Result
  const handleSubmit = () => {
    if(!confirm("Are you sure you want to submit?")) return;
    
    let totalScore = 0;
    questions.forEach((q, index) => {
        const studentAns = answers[index];
        if (studentAns === q.correct_option) {
            totalScore += 1; // +1 for correct
        }
    });
    setScore(totalScore);
    setIsSubmitted(true);
  };

  // --- LOADING STATE ---
  if (questions.length === 0) return <div className="p-10 text-center">Loading your exam paper... 📄</div>;

  const currentQuestion = questions[currentQ];

  // --- FORMAT TIMER (MM:SS) ---
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      
      {/* HEADER: Timer & Submit */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-lg text-gray-800">Question {currentQ + 1} / {questions.length}</h1>
        
        {!isSubmitted ? (
            <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-700'}`}>
                ⏱️ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
        ) : (
            <div className="text-green-600 font-bold text-xl">EXAM COMPLETED</div>
        )}

        {!isSubmitted && (
            <button onClick={handleSubmit} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700">
                Submit Test
            </button>
        )}
      </div>

      {/* MAIN EXAM AREA */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8">
        
        {isSubmitted ? (
            // --- RESULT SCREEN ---
            <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Submitted!</h2>
                <p className="text-gray-500 mb-6">You have successfully completed the test.</p>
                
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 inline-block mb-8">
                    <span className="block text-gray-500 text-sm uppercase tracking-wide">Your Score</span>
                    <span className="text-5xl font-extrabold text-blue-700">{score} / {questions.length}</span>
                </div>

                <div className="block">
                    <button onClick={() => router.push('/')} className="text-blue-600 font-bold hover:underline">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        ) : (
            // --- QUESTION SCREEN ---
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm">
                <h2 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                    {currentQuestion.question_text}
                </h2>

                <div className="space-y-4">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                        const optionText = currentQuestion[`option_${opt.toLowerCase()}`]; // Gets option_a, option_b...
                        const isSelected = answers[currentQ] === opt;
                        
                        return (
                            <div 
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-4 ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {opt}
                                </div>
                                <span className="text-gray-700">{optionText}</span>
                            </div>
                        );
                    })}
                </div>

                {/* NAVIGATION FOOTER */}
                <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                    <button 
                        disabled={currentQ === 0}
                        onClick={() => setCurrentQ(prev => prev - 1)}
                        className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        ← Previous
                    </button>

                    {currentQ < questions.length - 1 ? (
                        <button 
                            onClick={() => setCurrentQ(prev => prev + 1)}
                            className="px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Next Question →
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            className="px-6 py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700"
                        >
                            Finish Test
                        </button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
