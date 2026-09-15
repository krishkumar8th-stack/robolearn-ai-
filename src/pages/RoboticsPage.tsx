import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  Trophy,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types/index';
import { MEDIA } from '../assets/media';

export const RoboticsPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const isLessonCompleted = (lessonId: string) => {
    return Boolean(user?.completedLessons?.includes(lessonId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" /> 10-Level Robotics Mastery Roadmap
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Learn Robotics & Embedded AI
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          A step-by-step curriculum taking you from fundamental voltage physics to designing autonomous mobile robots with computer vision.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => {
            const completedCount = course.lessons.filter(l => isLessonCompleted(l.id)).length;
            const progressPct = Math.round((completedCount / course.lessons.length) * 100);
            const courseImg = course.imageUrl || MEDIA.courses[course.id] || MEDIA.arduinoUno;

            return (
              <div
                key={course.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden"
              >
                {/* Course Header with Photographic Banner */}
                <div className="relative">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Real Image Thumbnail */}
                    <div className="relative w-full md:w-52 h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 group">
                      <img
                        src={courseImg}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono font-bold text-cyan-300">
                        <span>LEVEL 0{course.level}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm border border-slate-700">Lab Ready</span>
                      </div>
                    </div>

                    {/* Course Text Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-black text-cyan-400">
                            LEVEL 0{course.level}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {course.level <= 2 ? 'Beginner' : course.level <= 5 ? 'Intermediate' : 'Advanced'}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-white">{course.title}</h2>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl">{course.description}</p>
                      </div>

                      {/* Course Progress */}
                      <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                          <span>{completedCount}/{course.lessons.length} Lessons Complete</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-cyan-400 font-bold text-xs font-mono">{progressPct}%</span>
                          <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lessons in Course */}
                <div className="p-6 pt-0">
                  {course.lessons.map((lesson) => {
                    const done = isLessonCompleted(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        to={`/learn/${course.id}/${lesson.id}`}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            done ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {done ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition">
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {lesson.durationMinutes}m
                              </span>
                              <span>•</span>
                              <span className="text-amber-400 font-mono">+{lesson.xpReward} XP</span>
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
