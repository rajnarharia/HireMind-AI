import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Users, UserCheck, Calendar, 
  Plus, Trash2, Edit2, Loader2, X, Save,
  ArrowRight, Search, Activity, TrendingUp, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E', '#14B8A6'];

  async function fetchData() {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/analytics/recruiter/dashboard'),
        api.get('/recruiter/jobs')
      ]);
      setStats(statsRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(jobId) {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    setDeletingId(jobId);
    try {
      await api.delete(`/recruiter/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      await fetchData(); // refresh stats
    } catch (err) {
      console.error(err);
      alert('Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  }

  async function saveEdit(jobId) {
    setSaving(true);
    try {
      const updated = await api.put(`/recruiter/jobs/${jobId}`, {
        ...editForm,
        required_skills: editForm.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        openings: parseInt(editForm.openings)
      });
      setJobs(prev => prev.map(j => j.id === jobId ? updated.data : j));
      setEditingJob(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update job.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(job) {
    setEditingJob(job.id);
    setEditForm({
      title: job.title,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type || 'Full-time',
      salary_range: job.salary_range || '',
      description: job.description,
      required_skills: (job.required_skills || []).join(', '),
      experience: job.experience || '',
      openings: job.openings || 1,
      status: job.status
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-40 skeleton w-full"></div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton w-full"></div>)}
        </div>
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 skeleton w-1/3 mb-4"></div>
            {[1,2].map(i => <div key={i} className="h-40 skeleton w-full"></div>)}
          </div>
          <div className="space-y-6">
            <div className="h-10 skeleton w-1/2 mb-4"></div>
            <div className="h-96 skeleton w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Recruiter Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Manage your pipeline, jobs, and candidates across all active roles.</p>
        </div>
        <button 
          onClick={() => navigate('/recruiter/jobs/new')}
          className="relative z-10 btn-premium px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" /> Post New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Jobs" value={stats?.metrics?.total_jobs} icon={Briefcase} color="text-blue-500" bg="bg-blue-500/10" trend="Active" />
        <StatCard title="Total Candidates" value={stats?.metrics?.total_candidates} icon={Users} color="text-purple-500" bg="bg-purple-500/10" trend="+12%" />
        <StatCard title="Interviews Scheduled" value={stats?.metrics?.interviews_scheduled} icon={Calendar} color="text-emerald-500" bg="bg-emerald-500/10" trend="This Week" highlight />
        <StatCard title="Avg Time to Hire" value={`${stats?.metrics?.time_to_hire_days}d`} icon={Activity} color="text-orange-500" bg="bg-orange-500/10" trend="-2 days" />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><Target className="w-5 h-5 text-primary"/> Hiring Pipeline Funnel</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.pipeline_data || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.1} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={80} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff'}} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {(stats?.pipeline_data || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Candidate Sources */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><Users className="w-5 h-5 text-emerald-500"/> Candidate Sources</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.source_data || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(stats?.source_data || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Applications Over Time */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 relative overflow-hidden group lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><TrendingUp className="w-5 h-5 text-purple-500"/> Activity Trends</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.trends_data || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.1} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <RechartsTooltip cursor={{stroke: 'rgba(255,255,255,0.1)'}} contentStyle={{backgroundColor: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff'}} />
                <Line type="monotone" dataKey="applications" name="Applications" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill: '#3B82F6', strokeWidth: 0}} activeDot={{r: 6, strokeWidth: 0}} />
                <Line type="monotone" dataKey="interviews" name="Interviews" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981', strokeWidth: 0}} activeDot={{r: 6, strokeWidth: 0}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Briefcase className="w-5 h-5 text-primary"/> Active Roles</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search roles..." className="pl-9 pr-4 py-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <motion.div variants={itemVariants} className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-gray-200 dark:border-white/10">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active jobs</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first job posting to start building your AI-powered talent pipeline.</p>
                <button onClick={() => navigate('/recruiter/jobs/new')} className="btn-premium px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" /> Create Job Posting
                </button>
              </motion.div>
            ) : (
              jobs.map(job => (
                <motion.div key={job.id} variants={itemVariants} className="glass-card rounded-2xl p-6 group hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          job.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{job.department} • {job.location} • {job.employment_type}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(job)} className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)} 
                        disabled={deletingId === job.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        {deletingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => navigate(`/recruiter/jobs/${job.id}/pipeline`)}
                        className="px-4 py-2 ml-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                      >
                        Pipeline <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-white/5 relative z-10">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Openings</p>
                      <p className="font-bold text-gray-900 dark:text-white">{job.openings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Experience</p>
                      <p className="font-bold text-gray-900 dark:text-white truncate">{job.experience}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Skills Req</p>
                      <div className="flex gap-1 overflow-hidden">
                        {(job.required_skills || []).slice(0, 2).map((s, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-[#111827] rounded text-gray-600 dark:text-gray-300 truncate max-w-[80px] border border-gray-200 dark:border-white/5">{s}</span>
                        ))}
                        {(job.required_skills?.length > 2) && <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-[#111827] rounded text-gray-500 border border-gray-200 dark:border-white/5">+{job.required_skills.length - 2}</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Recent Activity */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Activity className="w-5 h-5 text-primary"/> Activity</h2>
          </div>
          
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none"></div>
             
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent">
              {/* Activity Timeline Items */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border-2 border-blue-500 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Users className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] glass-card p-4 rounded-xl md:group-odd:text-right border-gray-100 dark:border-white/5">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">New Applicant</div>
                  <div className="text-xs text-gray-500 mt-1">Jane Doe applied for Frontend Engineer</div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] glass-card p-4 rounded-xl md:group-odd:text-right border-gray-100 dark:border-white/5">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">Interview Scheduled</div>
                  <div className="text-xs text-gray-500 mt-1">Tech screen w/ John Smith at 2pm</div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 border-2 border-purple-500 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] glass-card p-4 rounded-xl md:group-odd:text-right border-gray-100 dark:border-white/5">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">AI Evaluation Complete</div>
                  <div className="text-xs text-gray-500 mt-1">Report ready for Senior Backend Dev</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Job Modal */}
      <AnimatePresence>
        {editingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-16 md:pt-0">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingJob(null)}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 custom-scrollbar border border-gray-200 dark:border-white/10"
            >
              <div className="sticky top-0 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-8 py-5 flex justify-between items-center z-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Job Posting</h2>
                <button onClick={() => setEditingJob(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Department</label>
                    <input type="text" value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <input type="text" value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select value={editForm.status || 'active'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl appearance-none bg-white dark:bg-transparent">
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Employment Type</label>
                    <select value={editForm.employment_type || 'Full-time'} onChange={e => setEditForm({...editForm, employment_type: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl appearance-none bg-white dark:bg-transparent">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Number of Openings</label>
                    <input type="number" min="1" value={editForm.openings || 1} onChange={e => setEditForm({...editForm, openings: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Required Skills (comma separated)</label>
                    <input type="text" value={editForm.required_skills || ''} onChange={e => setEditForm({...editForm, required_skills: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl" placeholder="e.g. React, Python, AWS" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Experience Requirements</label>
                    <input type="text" value={editForm.experience || ''} onChange={e => setEditForm({...editForm, experience: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl" placeholder="e.g. 3-5 years of frontend development" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Description</label>
                    <textarea rows="6" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="input-premium w-full px-4 py-3 rounded-xl resize-none"></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-white/5">
                  <button onClick={() => setEditingJob(null)} className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => saveEdit(editingJob)} disabled={saving} className="btn-premium px-8 py-3 rounded-xl flex items-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg, trend, highlight }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, scale: 0.95 },
      show: { opacity: 1, scale: 1 }
    }}
    className={`glass-card rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl ${highlight ? 'border-primary/30 ring-1 ring-primary/20' : ''}`}
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} blur-2xl group-hover:blur-3xl transition-all`}></div>
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">{trend}</span>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value !== undefined ? value : '--'}</span>
      </div>
    </div>
  </motion.div>
);

export default RecruiterDashboard;