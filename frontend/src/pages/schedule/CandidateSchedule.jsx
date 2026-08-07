import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Video, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Download, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function CandidateSchedule() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);


  async function fetchInterviews() {
    try {
      const res = await api.get('/schedule/interviews');
      setInterviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/schedule/interviews/${id}/status?status=${status}`);
      fetchInterviews();
    } catch (err) {
      console.error(err);
    }
  }

  function generateICS(interview) {
    function formatDate(dateString) {
      const d = new Date(dateString);
      return d.toISOString().replace(/-|:|\.\d+/g, '');
    }

    const start = formatDate(interview.start_time);
    const end = formatDate(interview.end_time);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${interview.interview_type} - HireMind AI
DESCRIPTION:Interview via ${interview.meeting_mode}. Link: ${interview.meeting_link || 'N/A'}
LOCATION:${interview.meeting_mode}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'interview.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    fetchInterviews();
  }, []);

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Scheduling
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">My Interviews</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 max-w-xl">Manage your upcoming interview schedules, accept invitations, and join meetings seamlessly.</p>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center border-dashed border-2 border-gray-200 dark:border-white/10 relative overflow-hidden">
          <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Interviews Scheduled</h2>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">You don't have any upcoming interviews at the moment. Keep building your skills!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {interviews.map(interview => (
              <motion.div 
                key={interview.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 md:p-8 rounded-3xl group hover:shadow-2xl transition-all relative overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0A0D14]/80"
              >
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-all ${
                  interview.status === 'Confirmed' ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' :
                  interview.status === 'Cancelled' ? 'bg-red-500/5 group-hover:bg-red-500/10' :
                  'bg-orange-500/5 group-hover:bg-orange-500/10'
                }`}></div>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                  
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        interview.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        interview.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                        {interview.status === 'Confirmed' ? <CheckCircle className="w-3.5 h-3.5" /> :
                         interview.status === 'Cancelled' ? <XCircle className="w-3.5 h-3.5" /> :
                         <AlertCircle className="w-3.5 h-3.5" />}
                        {interview.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{interview.interview_type}</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">{interview.notes || 'No specific notes provided for this interview.'}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date & Time</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {format(parseISO(interview.start_time), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                          {interview.meeting_mode.toLowerCase().includes('video') ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location / Mode</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{interview.meeting_mode}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-3 md:w-56 shrink-0">
                    {interview.status === 'Pending' && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button 
                          onClick={() => updateStatus(interview.id, 'Confirmed')}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-colors shadow-sm"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button 
                          onClick={() => updateStatus(interview.id, 'Cancelled')}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    )}

                    {interview.status === 'Confirmed' && interview.meeting_link && (
                      <a 
                        href={interview.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full btn-premium py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        <Video className="w-5 h-5" /> Join Meeting
                      </a>
                    )}
                    
                    {interview.status !== 'Cancelled' && (
                      <button 
                        onClick={() => generateICS(interview)}
                        className="w-full px-4 py-3 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 hover:border-primary/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Add to Calendar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default CandidateSchedule;
