import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, MoreHorizontal, FileText, BrainCircuit, Code2, AlertTriangle, CheckCircle, ShieldAlert, Filter, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = ['Applied', 'Screening', 'Interview', 'Coding', 'HR Round', 'Offer', 'Hired', 'Rejected'];

function RecruiterPipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [minScore, setMinScore] = useState(0);


  async function fetchCandidates() {
    try {
      const res = await api.get(`/recruiter/applications/${jobId}`);
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(appId, newStatus) {
    try {
      await api.put(`/recruiter/applications/${appId}/status?new_status=${newStatus}`);
      setCandidates(prev => prev.map(c => 
        c.application.id === appId ? { ...c, application: { ...c.application, status: newStatus } } : c
      ));
    } catch (err) {
      console.error(err);
      fetchCandidates();
    }
  }

  function handleDragEnd(appId, newStatus) {
    updateStatus(appId, newStatus);
  }

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-6rem)] flex flex-col space-y-6 pb-6">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-6 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <button 
            onClick={() => navigate('/recruiter')} 
            className="p-3 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Candidate Tracking
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Active Pipeline</h1>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 md:flex-none px-4 py-2.5 border font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${showFilters ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 shrink-0"
          >
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe"
                className="w-full input-premium px-4 py-2 rounded-xl text-sm bg-white dark:bg-[#111827]"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min AI Score ({minScore})</label>
              <input 
                type="range" 
                min="0" max="100"
                className="w-full accent-primary"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 relative">
        <div className="flex gap-4 h-full min-w-max px-2 absolute inset-0">
          
          {COLUMNS.map((col, index) => {
            const colCandidates = candidates.filter(c => {
              const matchStatus = c.application.status === col;
              const matchName = c.user.name.toLowerCase().includes(filterText.toLowerCase());
              const score = c.report?.overall_score || 0;
              const matchScore = score >= minScore;
              return matchStatus && matchName && matchScore;
            });
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={col} 
                className="w-[320px] h-full flex flex-col bg-gray-50/50 dark:bg-[#0A0D14]/50 rounded-3xl border border-gray-200 dark:border-white/5"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const appId = parseInt(e.dataTransfer.getData("appId"));
                  if (appId) handleDragEnd(appId, col);
                }}
              >
                {/* Column Header */}
                <div className="p-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center sticky top-0 bg-gray-50/80 dark:bg-[#0A0D14]/80 backdrop-blur-md rounded-t-3xl z-10">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider flex items-center gap-2">
                    {col === 'Hired' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {col === 'Rejected' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                    {col}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-black shadow-sm text-gray-500">
                    {colCandidates.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                  <AnimatePresence>
                    {colCandidates.map(c => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={c.application.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("appId", c.application.id)}
                        onClick={() => navigate(`/recruiter/candidate/${c.application.id}`)}
                        className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[30px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center font-black shadow-inner border border-gray-200 dark:border-white/5">
                              {c.user.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{c.user.name}</h4>
                              <p className="text-xs text-gray-500 font-medium">{c.user.email.split('@')[0]}</p>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {c.report && (
                          <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-3 mt-4 space-y-3 relative z-10 border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AI Score</span>
                              <span className="text-sm font-black text-primary">{c.report.overall_score}/100</span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center" title="Resume Score">
                                <FileText className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{c.report.resume_score}</p>
                              </div>
                              <div className="text-center" title="Interview Score">
                                <BrainCircuit className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{c.report.interview_score}</p>
                              </div>
                              <div className="text-center" title="Coding Score">
                                <Code2 className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{c.report.coding_score}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!c.report && (
                          <div className="flex items-center gap-2 text-xs text-orange-500 font-bold bg-orange-500/10 p-3 rounded-xl mt-4 relative z-10">
                            <AlertTriangle className="w-4 h-4" /> Pending Evaluation
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default RecruiterPipeline;
