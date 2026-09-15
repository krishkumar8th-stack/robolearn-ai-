import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Play,
  Sparkles,
  Trophy,
  Clock,
  HelpCircle,
  Box,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MonacoEditorPanel } from '../components/editor/MonacoEditorPanel';
import { CourseLesson } from '../types/index';
import { MEDIA } from '../assets/media';

export const LessonDetailPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user, addXp } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      if (!courseId || !lessonId) return;
      try {
        const data = await api.getLesson(courseId, lessonId);
        setLesson(data);
        setIsCompleted(Boolean(user?.completedLessons?.includes(lessonId)));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [courseId, lessonId, user]);

  const handleCompleteLesson = async () => {
    if (!lesson || isCompleted) return;
    try {
      const res = await api.completeLesson(lesson.id);
      setIsCompleted(true);
      if (res.xpEarned > 0) {
        addXp(res.xpEarned, 'Lesson Completed');
      }
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-950 text-white">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-[60vh] flex flex-col items-center justify-center bg-slate-950">
        <p>Lesson not found.</p>
        <Link to="/learn" className="mt-4 text-cyan-400 hover:underline">
          Back to Curriculum
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/learn"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Curriculum
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/lab3d"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800 transition"
          >
            <Box className="w-3.5 h-3.5" />
            3D Lab
          </Link>

          <button
            onClick={handleCompleteLesson}
            disabled={isCompleted}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow ${
              isCompleted
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isCompleted ? 'Completed (+XP Claimed)' : `Complete Lesson (+${lesson.xpReward} XP)`}
          </button>
        </div>
      </div>

      {/* Lesson Header & Photographic Context Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6 overflow-hidden">
        {/* Real Hardware Lab Banner */}
        <div className="relative w-full h-48 sm:h-56 bg-slate-950 overflow-hidden group">
          <img
            src={courseId ? (MEDIA.courses[courseId] || MEDIA.labEnvironment) : MEDIA.labEnvironment}
            alt={lesson.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Interactive Hardware Theory & Laboratory
          </div>

          <div className="absolute bottom-3 left-6 right-6">
            <div className="flex items-center gap-3 text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1 font-mono text-cyan-300">
                <Clock className="w-3.5 h-3.5" /> {lesson.durationMinutes} Minutes
              </span>
              <span>•</span>
              <span className="text-amber-300 font-mono font-bold">+{lesson.xpReward} XP</span>
              <span>•</span>
              <span className="text-emerald-300 font-mono">Hardware Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{lesson.title}</h1>
          </div>
        </div>
      </div>

      {/* Lesson Markdown Content */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
        <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {lesson.content}
        </div>
      </div>

      {/* Code Editor Practice Bench */}
      {lesson.starterCode && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" /> Interactive Practice & Firmware
            </h3>
            <span className="text-xs text-slate-400">Run code in real-time virtual MCU</span>
          </div>

          <MonacoEditorPanel
            initialCode={lesson.starterCode}
            language="cpp"
            targetBoard="Arduino Uno"
            height="380px"
          />
        </div>
      )}

      {/* Mini Comprehension Quiz */}
      {lesson.quiz && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-8">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Knowledge Check</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium mb-4">
            {lesson.quiz.question}
          </p>

          <div className="space-y-2">
            {lesson.quiz.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === lesson.quiz?.correctIndex;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800';
              if (isAnswerSubmitted) {
                if (isCorrect) btnStyle = 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-bold';
                else if (isSelected) btnStyle = 'bg-rose-950/60 border-rose-600 text-rose-300';
              } else if (isSelected) {
                btnStyle = 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-semibold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswerSubmitted && setSelectedAnswer(idx)}
                  className={`w-full p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
            {isAnswerSubmitted ? (
              <p className="text-xs text-slate-300">
                {selectedAnswer === lesson.quiz.correctIndex ? (
                  <span className="text-emerald-400 font-bold">Correct! Well done.</span>
                ) : (
                  <span className="text-rose-400 font-bold">Incorrect. Review the lesson explanation above!</span>
                )}
              </p>
            ) : (
              <span className="text-[11px] text-slate-500">Select an option and submit to test your knowledge</span>
            )}

            <button
              onClick={() => setIsAnswerSubmitted(true)}
              disabled={selectedAnswer === null || isAnswerSubmitted}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              Check Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
