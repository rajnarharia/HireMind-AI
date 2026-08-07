import { motion } from 'framer-motion';
import { BrainCircuit, Play, FileText, History, Target, Loader2 } from 'lucide-react';

export default function InterviewLobby({ resumes, history, isProcessing, onStart, onLoad }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 w-full max-w-7xl mx-auto h-full flex flex-col relative z-10">
      
      {/* Ethereal Hero */}
      <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 border border-white/20 dark:border-white/5 bg-gradient-to-br from-white/60 to-white/10 dark:from-black/40 dark:to-black/10 backdrop-blur-3xl shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-[90px] pointer-events-none"></div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-widest uppercase">
            <BrainCircuit className="w-4 h-4" /> Studio Mode
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
            AI Interview <span className="text-gradient">Experience</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Immersive technical and behavioral screening powered by real-time voice and cognitive evaluation.
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Start New */}
        <div className="glass-card hover-3d rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all flex flex-col">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
              <Play className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Start Session</h2>
              <p className="text-sm text-gray-500 font-medium">Select a resume to calibrate the AI</p>
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {resumes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <FileText className="w-12 h-12 mb-4" />
                <p>No resumes uploaded yet.</p>
              </div>
            ) : (
              resumes.map(resume => (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={resume.id} className="p-4 rounded-2xl bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-white/10 hover:shadow-xl transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{resume.filename}</h4>
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        <Target className="w-3 h-3" /> Target: Software Engineer
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onStart(resume.id)} 
                    disabled={isProcessing}
                    className="w-full sm:w-auto btn-premium btn-3d px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-emerald-500/20"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch'}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* History */}
        <div className="glass-card hover-3d rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-all flex flex-col">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Past Sessions</h2>
              <p className="text-sm text-gray-500 font-medium">Review evaluations and scores</p>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
             {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <History className="w-12 h-12 mb-4" />
                <p>No past interviews found.</p>
              </div>
            ) : (
              history.map(interview => (
                <motion.div onClick={() => onLoad(interview.id)} whileHover={{ scale: 1.02 }} key={interview.id} className="p-4 rounded-2xl bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-white/10 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">SWE Technical Screen</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">{new Date(interview.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-1 ${interview.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {interview.status}
                    </span>
                    {interview.status === 'completed' && (
                       <p className="text-sm font-black text-gray-900 dark:text-white">Score: {interview.overall_score || 0}/100</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
