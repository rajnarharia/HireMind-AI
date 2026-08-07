import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Code2, BrainCircuit, FileText, 
  Target, Zap, Clock, ChevronRight, Activity, Map,
  ArrowRight, ShieldCheck, Sparkles, Calendar, Plus, Bot, BarChart3, TrendingUp
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const CircularProgress = ({ value, color, size = 56, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - ((value || 0) / 100) * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-100 dark:text-white/5" />
        <motion.circle 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
        {value || 0}%
      </div>
    </div>
  )
};

const Sparkline = ({ data, color, dataKey = "score" }) => {
  const safeData = data?.length > 1 ? data : data?.length === 1 ? [data[0], data[0]] : [{score:0}, {score:0}];
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={safeData}>
          <defs>
            <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${color})`} isAnimationActive={true} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
};

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePieIndex, setActivePieIndex] = useState(null);

  async function fetchDashboard() {
    try {
      const res = await api.get('/profile/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
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
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-32 skeleton w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton w-full"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 skeleton w-full"></div>
          <div className="h-96 skeleton w-full"></div>
        </div>
      </div>
    );
  }

  const doughnutData = [
    { name: 'Resume Match', value: data?.scores?.resume_ats || 0, color: '#3b82f6' },
    { name: 'Coding Score', value: data?.scores?.coding || 0, color: '#10b981' },
    { name: 'Interview Score', value: data?.scores?.interview || 0, color: '#8b5cf6' },
    { name: 'AI Readiness', value: data?.scores?.overall_readiness || 0, color: '#FF7A00' },
  ].filter(d => d.value > 0);

  if (doughnutData.length === 0) doughnutData.push({ name: 'No Data', value: 100, color: '#e5e7eb' });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Top Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your premium analytics and readiness metrics.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard/resume')} className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-[var(--background)] shadow-sm transition-all">
            <Plus className="w-4 h-4" /> New Analysis
          </button>
        </div>
      </motion.div>

      {/* Radial Progress Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Resume Match" 
          value={data?.scores?.resume_ats} 
          icon={FileText} 
          color="text-blue-500" 
          trend={data?.charts?.coding_trend ? "+5%" : "--"} 
          sparklineData={[{score: (data?.scores?.resume_ats || 0) - 10}, {score: data?.scores?.resume_ats || 0}]} 
          sparklineColor="#3b82f6"
        />
        <StatCard 
          title="Coding Score" 
          value={data?.scores?.coding} 
          icon={Code2} 
          color="text-emerald-500" 
          trend={data?.charts?.coding_trend?.length > 1 ? "+12%" : "--"} 
          sparklineData={data?.charts?.coding_trend} 
          sparklineColor="#10b981"
        />
        <StatCard 
          title="Interview Score" 
          value={data?.scores?.interview} 
          icon={BrainCircuit} 
          color="text-purple-500" 
          trend={data?.charts?.interview_trend?.length > 1 ? "+8%" : "--"} 
          sparklineData={data?.charts?.interview_trend} 
          sparklineColor="#8b5cf6"
        />
        <StatCard 
          title="AI Readiness" 
          value={data?.scores?.overall_readiness} 
          icon={Target} 
          color="text-primary" 
          trend="+15%" 
          sparklineData={[{score: (data?.scores?.overall_readiness || 0) - 5}, {score: data?.scores?.overall_readiness || 0}]} 
          sparklineColor="#FF7A00"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Analytics Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <motion.div variants={itemVariants} className="bg-[var(--surface)] dark:bg-[#111827] rounded-[16px] p-8 border border-gray-200 dark:border-white/5 shadow-sm hover-3d relative overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary"/> Readiness Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Holistic view of your candidate profile strength.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={doughnutData}
                      cx="50%" cy="50%"
                      innerRadius={80} outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={1500}
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(null)}
                      cornerRadius={8}
                      stroke="none"
                    >
                      {doughnutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} 
                          style={{ 
                            filter: activePieIndex === index ? `drop-shadow(0px 4px 12px ${entry.color}60)` : 'none',
                            transform: activePieIndex === index ? 'scale(1.03)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{data?.scores?.overall_readiness || 0}%</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Match</span>
                </div>
              </div>

              <div className="space-y-3">
                {doughnutData.filter(d => d.name !== 'No Data').map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 transition-all cursor-default group" onMouseEnter={() => setActivePieIndex(i)} onMouseLeave={() => setActivePieIndex(null)}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{stat.name}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white group-hover:scale-110 transition-transform">{stat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column (Copilot, Upcoming) */}
        <div className="flex flex-col gap-6">
          
          <motion.div variants={itemVariants} className="bg-gradient-to-b from-primary to-secondary rounded-[16px] p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden hover-3d group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--surface)]/10 rounded-full blur-[40px] group-hover:bg-[var(--surface)]/20 transition-all pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--surface)]/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">Copilot Insights</h2>
            </div>
            
            <p className="text-sm text-white/90 leading-relaxed mb-6">
              "Your Python skills are in the top 10% this week. Consider taking a mock interview for Senior Backend roles to unlock more opportunities."
            </p>
            
            <button onClick={() => navigate('/dashboard/copilot')} className="w-full py-3 bg-[var(--surface)] text-primary text-sm font-bold rounded-xl hover:bg-[var(--background)] transition-colors flex items-center justify-center gap-2">
              <Bot className="w-4 h-4"/> Chat with Copilot
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[var(--surface)] dark:bg-[var(--surface)] rounded-[16px] p-6 border border-gray-200 dark:border-white/5 shadow-sm hover-3d">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
              <span>Upcoming Events</span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </h2>
            <div className="text-center py-6 bg-[var(--background)] dark:bg-[var(--surface)]/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No upcoming interviews.</p>
              <button className="mt-3 text-primary text-sm font-bold hover:underline">Schedule one</button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom Section: 3 equal height boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <motion.div variants={itemVariants} className="bg-[var(--surface)] dark:bg-[var(--surface)] rounded-[16px] p-6 border border-gray-200 dark:border-white/5 shadow-sm hover-3d flex flex-col h-full">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-gray-400">Skill Proficiency</h2>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {data?.charts?.skills?.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-700 dark:text-gray-300">{skill.subject}</span>
                  <span className="text-gray-500">{skill.A}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-[var(--surface)]/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${skill.A}%` }} 
                    transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-sm"
                  />
                </div>
              </div>
            ))}
            {(!data?.charts?.skills || data.charts.skills.length === 0) && (
              <div className="text-sm text-gray-500">No skill data available.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[var(--surface)] dark:bg-[var(--surface)] rounded-[16px] p-6 border border-gray-200 dark:border-white/5 shadow-sm hover-3d flex flex-col h-full justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-gray-400">Weekly Progress</h2>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <CircularProgress value={data?.roadmap_progress || 0} color="text-primary" size={120} strokeWidth={8} textSize="text-2xl" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-[var(--background)] dark:bg-[var(--surface)]/5 p-4 rounded-xl text-center border border-gray-100 dark:border-white/5 shadow-sm hover-3d">
              <div className="text-2xl font-black text-gray-900 dark:text-white">{data?.profile?.xp || 0}</div>
              <div className="text-xs font-bold text-gray-500 uppercase">Total XP</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl text-center border border-orange-200 dark:border-orange-500/20 shadow-sm hover-3d">
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{data?.profile?.streak || 0}</div>
              <div className="text-xs font-bold text-orange-500 uppercase">Day Streak</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[var(--surface)] dark:bg-[var(--surface)] rounded-[16px] p-6 border border-gray-200 dark:border-white/5 shadow-sm hover-3d flex-1 flex flex-col h-full">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-gray-400">Activity Timeline</h2>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-[var(--surface)]/10">
            {data?.recent_activity?.filter(a => a.date).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,4).map((act, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-[var(--surface)] dark:bg-[var(--surface)] ${
                  act.type.includes('Resume') ? 'border-blue-500 text-blue-500' : 
                  act.type.includes('Interview') ? 'border-purple-500 text-purple-500' :
                  act.type.includes('Coding') ? 'border-emerald-500 text-emerald-500' :
                  'border-orange-500 text-orange-500'
                }`}>
                  {act.type.includes('Resume') ? <FileText className="w-3 h-3" /> : 
                   act.type.includes('Interview') ? <BrainCircuit className="w-3 h-3" /> : 
                   act.type.includes('Coding') ? <Code2 className="w-3 h-3" /> : 
                   <Activity className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{act.type}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
            {(!data?.recent_activity || data.recent_activity.filter(a => a.date).length === 0) && (
              <div className="text-center py-4 text-xs text-gray-500">No recent activity.</div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, sparklineData, sparklineColor, highlight }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, scale: 0.95 },
      show: { opacity: 1, scale: 1 }
    }}
    className={`bg-[var(--surface)] dark:bg-[#111827] rounded-[16px] p-5 relative overflow-hidden border ${highlight ? 'border-primary/30 ring-1 ring-primary/10 shadow-sm shadow-primary/5' : 'border-gray-200 dark:border-white/5'} hover-3d flex-1`}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value !== undefined ? value : '--'}</span>
          {trend && trend !== "--" && (
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" /> {trend}
            </span>
          )}
        </div>
      </div>
      <CircularProgress value={value} color={color} size={46} strokeWidth={4} />
    </div>
    
    <div className="flex items-end justify-between mt-4">
      <div className="text-xs text-gray-400 font-medium">Last 30 days</div>
      <Sparkline data={sparklineData} color={sparklineColor} />
    </div>
  </motion.div>
);

export default Dashboard;
