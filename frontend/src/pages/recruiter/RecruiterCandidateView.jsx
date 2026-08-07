import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, BrainCircuit, Target, Mail, Calendar, CheckCircle, XCircle, Award, Briefcase, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const ScoreBar = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-black ${color.replace('bg-', 'text-')}`}>{Math.round(score)}%</span>
    </div>
    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200 dark:border-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(score, 100)}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${color} relative`}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
      </motion.div>
    </div>
  </div>
);

function RecruiterCandidateView() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);


  async function fetchCandidate() {
    try {
      const jobsRes = await api.get('/recruiter/jobs');
      let foundCandidate = null;

      for (const job of jobsRes.data) {
        const appsRes = await api.get(`/recruiter/applications/${job.id}`);
        foundCandidate = appsRes.data.find(c => String(c.application.id) === String(appId));
        if (foundCandidate) {
          foundCandidate._job = job;
          break;
        }
      }

      setData(foundCandidate || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus) {
    if (!data) return;
    setUpdating(true);
    try {
      await api.put(`/recruiter/applications/${appId}/status?new_status=${newStatus}`);
      setData(prev => ({
        ...prev,
        application: { ...prev.application, status: newStatus }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    fetchCandidate();
  }, [appId]);

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading candidate dossier...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 glass-card hover-3d rounded-3xl max-w-2xl mx-auto border-dashed border-2">
        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Candidate Not Found</h2>
        <p className="text-gray-500 max-w-sm mx-auto">This application may not exist or has been removed from the pipeline.</p>
        <button onClick={() => navigate(-1)} className="mt-8 btn-premium btn-3d px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Go Back
        </button>
      </motion.div>
    );
  }

  const radarData = [
    { subject: 'Resume', value: Math.round(data.resume_score) },
    { subject: 'Interview', value: Math.round(data.interview_score) },
    { subject: 'Coding', value: Math.round(data.coding_score) },
    { subject: 'Skill Match', value: Math.round(data.skill_match) },
    { subject: 'Readiness', value: Math.round(data.overall_readiness) },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white dark:bg-[var(--surface)] border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm shrink-0"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20 border border-white/10 shrink-0">
              {data.user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{data.user.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Mail className="w-4 h-4"/> {data.user.email}</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full border border-gray-200 dark:border-white/10 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Applying for {data._job?.title}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  data.application.status === 'Hired' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  data.application.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  <Target className="w-3.5 h-3.5" /> Stage: {data.application.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          <button 
            onClick={() => navigate(`/recruiter/schedule/${appId}`, { state: { candidateId: data.user.id, candidateName: data.user.name } })}
            className="w-full md:w-auto btn-premium btn-3d px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Calendar className="w-5 h-5" /> Schedule Interview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions & Scores */}
        <div className="space-y-8">
          
          <div className="glass-card hover-3d rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-[var(--surface)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-primary/10"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><Zap className="w-5 h-5 text-primary"/> Pipeline Actions</h2>
            
            <div className="space-y-3 relative z-10">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Update Stage</label>
              <select 
                className="input-premium w-full px-4 py-3 rounded-xl text-sm appearance-none bg-white dark:bg-transparent font-bold cursor-pointer"
                value={data.application.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating}
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Coding">Coding</option>
                <option value="HR Round">HR Round</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={() => updateStatus('Hired')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-colors shadow-sm text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Hire
                </button>
                <button 
                  onClick={() => updateStatus('Rejected')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors shadow-sm text-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card hover-3d rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-[var(--surface)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-accent/10"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><Award className="w-5 h-5 text-accent"/> AI Scores</h2>
            
            <div className="flex flex-col items-center mb-8 relative z-10">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">HireMind Match</span>
              <div className="w-32 h-32 relative flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 rounded-full border-4 border-gray-100 dark:border-white/10 shadow-inner">
                <span className="text-4xl font-black text-primary">{Math.round(data.overall_readiness)}</span>
                <span className="text-sm font-bold text-gray-400">/ 100</span>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <ScoreBar label="Resume Match" score={data.resume_score} color="bg-blue-500" />
              <ScoreBar label="AI Interview" score={data.interview_score} color="bg-purple-500" />
              <ScoreBar label="Coding Challenge" score={data.coding_score} color="bg-orange-500" />
              <ScoreBar label="Skill Proficiency" score={data.skill_match} color="bg-emerald-500" />
            </div>
          </div>

        </div>

        {/* Right Column: Deep Dive */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Radar Chart */}
          <div className="glass-card hover-3d rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-[var(--surface)] shadow-xl relative overflow-hidden">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-900 dark:text-white"><ShieldCheck className="w-5 h-5 text-primary"/> Competency Radar</h2>
            <p className="text-sm text-gray-500 mb-6">Visual representation of candidate strengths across required dimensions.</p>
            
            <div className="h-[350px] bg-gray-50 dark:bg-black/20 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(128,128,128,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#888', fontSize: 12, fontWeight: 700}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Candidate" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Synthesis */}
          <div className="glass-card hover-3d rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-[var(--surface)] shadow-xl relative overflow-hidden">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><BrainCircuit className="w-5 h-5 text-primary"/> AI Synthesis</h2>
            
            {data.report ? (
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <ReactMarkdown>{data.report.final_recommendation}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <BrainCircuit className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Candidate hasn't completed all assessments to generate a final synthesis.</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </motion.div>
  );
};

export default RecruiterCandidateView;
