import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Map, CheckCircle2, PlayCircle, BookOpen, 
  Code2, Trophy,
  ExternalLink, Target, Sparkles, Navigation, Calendar, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

function LearningRoadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeMap, setActiveMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const roadmapRef = useRef(null);

  function downloadPDF() {
    const element = roadmapRef.current;
    if (!element) return;
    
    const opt = {
      margin: 10,
      filename: `HireMind_Roadmap_${activeMap?.id || 'export'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }


  async function fetchRoadmaps() {
    try {
      const res = await api.get('/roadmap/my');
      setRoadmaps(res.data);
      if (res.data.length > 0) {
        setActiveMap(res.data[0]);
        setExpandedWeek(res.data[0].weeks[0]?.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(taskId) {
    try {
      const res = await api.post(`/roadmap/task/${taskId}/toggle`);
      if (activeMap) {
        const newMap = { ...activeMap };
        let wIdx = -1;
        let tIdx = -1;
        
        newMap.weeks.forEach((w, wi) => {
          w.tasks.forEach((t, ti) => {
            if (t.id === taskId) {
              wIdx = wi;
              tIdx = ti;
            }
          });
        });

        if (wIdx > -1 && tIdx > -1) {
          newMap.weeks[wIdx].tasks[tIdx].is_completed = res.data.is_completed;
          newMap.weeks[wIdx].progress = res.data.week_progress;
          newMap.overall_progress = res.data.overall_progress;
          setActiveMap(newMap);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  function getResourceIcon(type) {
    switch(type) {
      case 'video': return <PlayCircle className="w-5 h-5" />;
      case 'article': return <BookOpen className="w-5 h-5" />;
      case 'exercise': return <Code2 className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  }

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center space-y-6 py-20 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/10 border border-primary/20">
          <Map className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">No Roadmap Found</h1>
        <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto">Complete a Resume Analysis, Interview, Coding Round, and generate a Hiring Report to unlock your personalized AI Learning Roadmap.</p>
        <button onClick={() => navigate('/dashboard/report')} className="btn-premium px-8 py-4 rounded-xl shadow-lg mt-8 inline-flex items-center gap-2 font-bold hover:scale-105 transition-transform">
          <Target className="w-5 h-5" /> Generate Hiring Report First
        </button>
      </motion.div>
    );
  }


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Curated Path
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{activeMap.target_role}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 max-w-xl">Your custom roadmap built to address specific skill gaps identified in your assessments.</p>
          <button 
            onClick={downloadPDF}
            className="mt-4 btn-premium px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>

        <div className="relative z-10 w-full md:w-auto flex flex-col md:items-end">
          <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-4 bg-white/50 dark:bg-black/20 border-primary/20 shadow-xl w-full md:w-auto">
            <div className="text-left md:text-right">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Overall Progress</p>
              <div className="flex items-center gap-3">
                <div className="w-32 md:w-48 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${activeMap.overall_progress}%` }} 
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
                <span className="text-xl font-black text-gray-900 dark:text-white">{activeMap.overall_progress}%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={roadmapRef} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar - Timeline */}
        <div className="lg:col-span-1 space-y-4 relative">
          <div className="sticky top-24 space-y-4">
            <div className="glass-card rounded-2xl p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider"><Navigation className="w-4 h-4 text-primary" /> Journey Map</h3>
              <div className="space-y-2 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent">
                {activeMap.weeks.map((week, idx) => (
                  <button 
                    key={week.id}
                    onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}
                    className={`w-full relative flex items-center gap-3 p-3 rounded-xl transition-all z-10 ${expandedWeek === week.id ? 'bg-white dark:bg-[#111827] shadow-md border border-gray-200 dark:border-white/10' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${week.progress === 100 ? 'bg-emerald-500 border-emerald-500 text-white' : expandedWeek === week.id ? 'bg-white dark:bg-black border-primary text-primary' : 'bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-gray-400'}`}>
                      {week.progress === 100 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${expandedWeek === week.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>Week {week.week_number}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{week.progress}% Complete</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Tasks */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {activeMap.weeks.map(week => (
              expandedWeek === week.id && (
                <motion.div 
                  key={week.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-primary" /> Week {week.week_number}: {week.topics}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {week.tasks.map(task => (
                      <motion.div 
                        key={task.id} 
                        layout
                        className={`glass-card rounded-2xl p-5 border transition-all ${
                          task.is_completed 
                            ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' 
                            : 'bg-white/50 dark:bg-[#111827]/80 border-gray-200 dark:border-white/5 hover:border-primary/30 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          
                          <motion.button 
                            whileTap={{ scale: 0.8, rotate: 10 }}
                            onClick={() => toggleTask(task.id)}
                            className="shrink-0 mt-1 focus:outline-none group"
                          >
                            {task.is_completed ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                                <CheckCircle2 className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-transparent group-hover:border-primary group-hover:bg-primary/5 transition-all">
                                <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-50 group-hover:text-primary transition-all" />
                              </div>
                            )}
                          </motion.button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                task.resource_type === 'video' ? 'bg-blue-500/10 text-blue-500' :
                                task.resource_type === 'article' ? 'bg-purple-500/10 text-purple-500' :
                                'bg-orange-500/10 text-orange-500'
                              }`}>
                                {getResourceIcon(task.resource_type)} {task.resource_type}
                              </span>
                            </div>
                            
                            <h4 className={`text-lg font-bold mb-2 transition-colors ${task.is_completed ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </h4>
                            
                            {task.resource_link && (
                              <a 
                                href={task.resource_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover hover:underline bg-primary/5 px-4 py-2 rounded-xl transition-colors"
                              >
                                Access Resource <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningRoadmap;
