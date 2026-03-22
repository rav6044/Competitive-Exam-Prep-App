import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveAnswer, clearAttempt } from "../features/attempt/attemptSlice";
import { setAnalytics } from "../features/analytics/analyticsSlice";
import useServerTimer from "../hooks/useServerTimer";
import useAntiCheat from "../hooks/useAntiCheat";
import useSocket from "../hooks/useSocket";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

// External logic remains intact
import formatTime from "../services/timer.service";
import { analyzePerformance } from "../services/analytics.service";
import { getNextQuestion } from "../services/adaptive.service";

/**
 * UNIQUE UI UTILITY COMPONENTS
 */
const StatusBadge = ({ label, color }) => (
  <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-white/10 border border-white/20">
    <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${color}`} />
    <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-80">{label}</span>
  </div>
);

export default function ExamPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const answers = useSelector((state) => state.attempt.answers);

  // Core State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [visited, setVisited] = useState({});
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Auto-open sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * 1. WEBSOCKET INTEGRATION
   */
  const { sendMessage } = useSocket((data) => {
    console.log("📡 WebSocket Pulse:", data);
  });

  /**
   * 2. DATA FETCHING & SYNC
   */
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get("/exam");
        if (!res.data || !res.data.questions) {
          setLoading(false);
          return;
        }
        setExam(res.data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Critical Load Error:", err);
        setLoading(false);
      }
    };
    fetchExam();
  }, []);

  /**
   * 3. VISITED TRACKING
   */
  useEffect(() => {
    if (!exam) return;
    const qId = exam.questions[currentIndex]?._id;
    if (!qId) return;
    setVisited((prev) => ({ ...prev, [qId]: true }));
  }, [currentIndex, exam]);

  /**
   * 4. BACKGROUND AUTO-SAVE
   */
  useEffect(() => {
    if (!exam) return;
    const interval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        api.post("/attempt/save", { answers, examId: exam._id }).catch(console.error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [answers, exam]);

  /**
   * 5. EVENT HANDLERS & SUBMISSION LOGIC
   */
  const handleAnswer = (option) => {
    if (!exam) return;
    const questionId = exam.questions[currentIndex]._id;
    dispatch(saveAnswer({ questionId, answer: option }));

    sendMessage({
      type: "ANSWER_UPDATE",
      payload: { questionId, option },
    });
  };

  const nextQuestion = () => {
    if (!exam) return;
    const weakTopics = analyzePerformance(exam.questions, answers);
    
    // Pass current index to the service to prevent jumping
    const nextQ = getNextQuestion(exam.questions, weakTopics, answers, currentIndex);
    
    if (!nextQ) return;
    const index = exam.questions.findIndex((q) => q._id === nextQ._id);
    if (index !== -1) setCurrentIndex(index);
  };

  const prevQuestion = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  // Modified handleSubmit to accept an 'auto' flag
  const handleSubmit = useCallback(async (isAuto = false) => {
    if (!exam) return;

    try {
      const res = await api.post("/attempt/submit", {
        answers,
        examId: exam._id,
        submissionType: isAuto ? "system_forced" : "user_initiated"
      });

      const { score, total, weakTopics } = res.data;
      dispatch(setAnalytics({ score, total, weakTopics }));
      dispatch(clearAttempt());
      navigate("/result");
    } catch (err) {
      console.error("Critical: Submission Failed", err);
      if(!isAuto) alert("Submission error. Your progress is saved locally. Please try again.");
    }
  }, [answers, exam, navigate, dispatch]);

  /**
   * 6. ANTI-CHEAT & TIMER ENGINE
   */
  // Auto-submit after 3 violations
  const violationCount = useAntiCheat(() => {
    console.warn("Anti-Cheat: Termination Limit Reached");
    handleSubmit(true); 
  }, 3);

  // Auto-submit when time runs out
  const timeLeft = useServerTimer(() => handleSubmit(true));

  // Derived Progress Data
  const stats = useMemo(() => {
    if (!exam) return { progress: 0, answered: 0 };
    const total = exam.questions.length;
    const answered = Object.keys(answers).length;
    return {
      progress: (answered / total) * 100,
      answered
    };
  }, [exam, answers]);

  /**
   * LOADING & ERROR STATES
   */
  if (loading) return (
    <div className="h-screen w-full bg-[#0f172a] flex flex-col justify-center items-center px-4 text-center">
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <h1 className="mt-8 text-sm md:text-base text-white/60 font-medium tracking-widest animate-pulse">SYNCHRONIZING EXAM DATA...</h1>
    </div>
  );

  if (!exam) return (
    <div className="h-screen w-full bg-[#0f172a] flex justify-center items-center px-4">
      <div className="p-8 md:p-10 rounded-3xl bg-red-500/10 border border-red-500/20 text-center max-w-md w-full">
        <h1 className="text-xl md:text-2xl text-red-500 font-bold">Session Sync Error</h1>
        <p className="text-sm md:text-base text-white/40 mt-2">No active exam instance found for your UID.</p>
      </div>
    </div>
  );

  const currentQuestion = exam.questions[currentIndex];

  return (
    <div className="h-screen w-full bg-[#0a0f1c] text-slate-200 flex overflow-hidden selection:bg-blue-500/30">
      
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed md:relative z-50 h-full transition-all duration-500 ease-in-out bg-[#0f172a] border-r border-white/5 overflow-hidden flex-shrink-0 ${
          isSidebarOpen ? 'w-[85vw] md:w-[380px] opacity-100 translate-x-0' : 'w-0 opacity-0 border-r-0 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="w-[85vw] md:w-[380px] h-full flex flex-col absolute inset-0">
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between items-start mb-8 md:mb-10">
              <div>
                <h2 className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-widest mb-1 md:mb-2">Internal Assessment</h2>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent truncate pr-4">{exam.title}</h1>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="md:hidden p-2 -mr-2 text-white/40 hover:text-white bg-white/5 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-5 md:p-6 rounded-3xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-xs md:text-sm font-medium opacity-60">Completion</span>
                  <span className="text-lg md:text-xl font-mono font-bold">{Math.round(stats.progress)}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-1000" 
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-5 md:mt-6">
                  <div className="text-center p-2 md:p-3 rounded-2xl bg-black/20">
                      <p className="text-[8px] md:text-[10px] uppercase opacity-40 font-bold">Answered</p>
                      <p className="text-base md:text-lg font-bold text-emerald-400">{stats.answered}</p>
                  </div>
                  <div className="text-center p-2 md:p-3 rounded-2xl bg-black/20">
                      <p className="text-[8px] md:text-[10px] uppercase opacity-40 font-bold">Total</p>
                      <p className="text-base md:text-lg font-bold">{exam.questions.length}</p>
                  </div>
                </div>
              </div>

              <div className="p-1 md:p-2">
                <div className="flex justify-between mb-4 px-1 md:px-2">
                  <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Question Grid</h3>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/10"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {exam.questions.map((q, i) => {
                    const isAnswered = !!answers[q._id];
                    const isActive = i === currentIndex;
                    const isVisited = visited[q._id];
                    
                    return (
                      <button
                        key={q._id}
                        onClick={() => {
                          setCurrentIndex(i);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={`
                          h-10 md:h-12 rounded-xl text-[10px] md:text-xs font-bold transition-all duration-300 transform
                          ${isActive ? 'bg-blue-600 text-white scale-105 shadow-lg shadow-blue-600/20 z-10' : 
                            isAnswered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                            isVisited ? 'bg-white/10 text-white border border-white/20' : 
                            'bg-transparent text-white/20 border border-white/5 hover:border-white/20'}
                        `}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8 border-t border-white/5 bg-black/20 grid grid-cols-2 gap-2 mt-auto">
            <StatusBadge label="Current" color="bg-blue-500" />
            <StatusBadge label="Saved" color="bg-emerald-500" />
            <StatusBadge label="Skipped" color="bg-white/20" />
            <StatusBadge label="Unseen" color="bg-white/5 opacity-20" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0">
        <nav className="h-20 md:h-24 px-4 sm:px-8 md:px-12 border-b border-white/5 flex items-center justify-between bg-[#0a0f1c]/80 backdrop-blur-xl z-20">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 focus:outline-none"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4 md:gap-8">
             <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Time Remaining</span>
                <div className={`text-2xl md:text-3xl font-mono font-black tracking-tighter ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </div>
             </div>
             <div className={`sm:hidden text-lg font-mono font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
             </div>

             <button 
                onClick={() => handleSubmit(false)}
                className="px-4 py-2.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs md:text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                FINISH <span className="hidden md:inline">EXAM</span>
              </button>
          </div>
        </nav>

        <section className="flex-1 overflow-y-auto px-4 py-8 md:px-12 md:py-16 flex justify-center">
            <div className="max-w-4xl w-full flex flex-col">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-12">
                    <div className="px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                        Intelligence Adaptive Mode
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                </div>

                <div className="mb-8 md:mb-12 relative">
                    <span className="text-4xl md:text-6xl font-black text-white/5 absolute -left-1 md:-left-4 -top-4 md:-top-8 select-none">
                        Q{currentIndex + 1}
                    </span>
                    <h2 className="text-xl md:text-3xl font-medium leading-relaxed md:leading-tight text-white/90 relative z-10 mt-2 md:mt-4">
                        {currentQuestion?.text}
                    </h2>
                </div>

                <div className="grid gap-3 md:gap-4 flex-1">
                    {currentQuestion?.options.map((opt, i) => {
                        const isSelected = answers[currentQuestion._id] === opt;
                        const label = String.fromCharCode(65 + i);

                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                className={`
                                    group relative p-4 md:p-6 rounded-2xl md:rounded-3xl text-left transition-all duration-300 border
                                    ${isSelected ? 
                                        'bg-blue-600 border-blue-400 shadow-xl md:shadow-2xl shadow-blue-600/20 md:translate-x-2' : 
                                        'bg-[#0f172a] border-white/5 hover:border-white/20 hover:bg-[#161e31]'}
                                `}
                            >
                                <div className="flex items-center gap-3 md:gap-6">
                                    <span className={`
                                        w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs md:text-sm transition-colors
                                        ${isSelected ? 'bg-white text-blue-600' : 'bg-black/20 text-white/40 group-hover:text-white'}
                                    `}>
                                        {label}
                                    </span>
                                    <span className={`text-sm md:text-lg transition-colors ${isSelected ? 'text-white font-semibold' : 'text-white/70'}`}>
                                        {opt}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 hidden sm:block">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white animate-ping"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 md:mt-16 w-full flex items-center justify-between pb-10 md:pb-8">
                    <button
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                        className={`group flex items-center gap-2 md:gap-3 px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl transition-all ${
                          currentIndex === 0 
                            ? 'bg-transparent text-white/10 cursor-not-allowed border border-transparent' 
                            : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white'
                        }`}
                    >
                        <svg className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${currentIndex !== 0 ? 'group-hover:-translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest">Back</span>
                    </button>

                    <button
                        onClick={nextQuestion}
                        className="group flex items-center gap-2 md:gap-4 px-5 py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all active:scale-95 text-white"
                    >
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">Smart Next</span>
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg className="w-3 h-3 md:w-4 md:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>
            </div>
        </section>

        <div className="absolute bottom-6 left-4 md:bottom-16 md:left-10 pointer-events-none">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-black/40 border border-white/5 backdrop-blur-md flex items-center gap-2 md:gap-3">
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse ${violationCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <span className="text-[7px] md:text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  {violationCount > 0 ? `Warnings: ${violationCount}/3` : 'Biometric & Tab Encryption Active'}
                </span>
            </div>
        </div>
      </main>
    </div>
  );
}