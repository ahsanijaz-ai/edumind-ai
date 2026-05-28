"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, Loader2, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Question {
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Quiz {
  questions: Question[];
}

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const params = useParams();
  const subjectId = params.id as string;
  const router = useRouter();

  useEffect(() => {
    generateQuiz();
  }, [subjectId]);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Read query params
      const searchParams = new URLSearchParams(window.location.search);
      const numQuestions = parseInt(searchParams.get("num_questions") || "5", 10);
      const docsParam = searchParams.get("docs");
      const docIds = docsParam ? docsParam.split(",") : null;

      const res = await fetch(`http://127.0.0.1:8000/api/v1/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: subjectId,
          student_id: session.user.id,
          difficulty: "medium",
          num_questions: numQuestions,
          doc_ids: docIds
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to generate quiz");
      }

      const data = await res.json();
      setQuiz(data.quiz);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (!isAnswerChecked) {
      setSelectedAnswer(option);
    }
  };

  const handleCheckAnswer = () => {
    if (!quiz || !selectedAnswer) return;
    const currentQ = quiz.questions[currentQuestionIndex];
    if (selectedAnswer === currentQ.correct_answer) {
      setScore(s => s + 1);
    }
    setIsAnswerChecked(true);
  };

  const handleNext = async () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      // Finish quiz
      setQuizFinished(true);
      await submitScore();
    }
  };

  const submitScore = async () => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const percentage = Math.round((score / quiz!.questions.length) * 100);
      
      await fetch("http://127.0.0.1:8000/api/v1/evaluations/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: "quiz-" + subjectId, // using subjectId as prefix since we don't store quiz generation
          student_id: session.user.id,
          score: percentage,
          feedback: percentage < 80 ? `Scored ${percentage}% on this quiz. Focus on reviewing the source material.` : "Excellent performance on the quiz."
        })
      });
    } catch (e) {
      console.error("Failed to submit score", e);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-blue-500" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-900">AI is analyzing your materials...</h2>
        <p className="text-slate-500 mt-2 font-medium">Generating a custom quiz based on your uploads.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl max-w-lg text-center shadow-sm">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Quiz Generation Failed</h2>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <Link href={`/dashboard/subjects/${subjectId}`} className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  if (quizFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-white border border-slate-200 p-10 rounded-3xl max-w-md w-full text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <Award className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-900 mb-2">Quiz Complete!</h1>
          <p className="text-slate-500 font-medium mb-8">Here is how you did on this topic.</p>
          
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-blue-700 mb-2">
            {percentage}%
          </div>
          <p className="text-slate-600 font-bold mb-10">You got {score} out of {quiz.questions.length} correct</p>

          <Link href={`/dashboard/subjects/${subjectId}`} className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black transition-all shadow-lg shadow-blue-500/20">
            Return to Subject
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 flex flex-col items-center" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-3xl">
        <Link href={`/dashboard/subjects/${subjectId}`} className="inline-flex items-center font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Quiz
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-slate-900">Knowledge Check</h1>
          <div className="flex gap-2">
            {quiz.questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 w-12 rounded-full transition-all ${
                  idx === currentQuestionIndex ? "bg-blue-500" : 
                  idx < currentQuestionIndex ? "bg-blue-200" : "bg-slate-200"
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed mb-10">
            {currentQ.question_text}
          </h2>

          <div className="space-y-4 mb-10">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQ.correct_answer;
              
              let buttonClass = "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ";
              
              if (!isAnswerChecked) {
                buttonClass += isSelected 
                  ? "border-blue-500 bg-blue-50 text-blue-900" 
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50";
              } else {
                if (isCorrect) {
                  buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  buttonClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isAnswerChecked}
                  className={buttonClass}
                >
                  <span className="text-base md:text-lg font-bold pr-4">{option}</span>
                  {isAnswerChecked && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
                  {isAnswerChecked && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswerChecked && (
            <div className={`p-6 rounded-2xl mb-8 border ${
              selectedAnswer === currentQ.correct_answer 
                ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}>
              <h4 className="font-black mb-2 flex items-center gap-2 text-lg">
                {selectedAnswer === currentQ.correct_answer ? "Correct!" : "Explanation"}
              </h4>
              <p className="font-medium leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            {!isAnswerChecked ? (
              <button 
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-black transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                Check Answer
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
