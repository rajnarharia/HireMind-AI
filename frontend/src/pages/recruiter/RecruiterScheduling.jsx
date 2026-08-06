import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Calendar as CalendarIcon, Video, Send, Loader2 } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function RecruiterScheduling() {
  const { appId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const candidateId = location.state?.candidateId;
  const candidateName = location.state?.candidateName || "Candidate";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    interview_type: 'Technical Interview',
    meeting_mode: 'Google Meet',
    start_time: '',
    duration_minutes: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notes: ''
  });

  async function fetchInterviews() {
    try {
      const res = await api.get('/schedule/interviews');
      const formattedEvents = res.data.map(int => ({
        id: int.id,
        title: `${int.interview_type} - ${int.status}`,
        start: new Date(int.start_time),
        end: new Date(int.end_time),
        status: int.status
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!candidateId) {
      alert("Missing candidate information. Please navigate from the pipeline.");
      return;
    }
    
    setLoading(true);
    try {
      const start = new Date(formData.start_time);
      const end = new Date(start.getTime() + formData.duration_minutes * 60000);
      
      const payload = {
        candidate_id: parseInt(candidateId),
        application_id: parseInt(appId),
        interview_type: formData.interview_type,
        meeting_mode: formData.meeting_mode,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: parseInt(formData.duration_minutes),
        timezone: formData.timezone,
        notes: formData.notes
      };

      await api.post('/schedule/interviews', payload);
      navigate(`/recruiter/candidate/${appId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectSlot({ start }) {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(start - tzoffset)).toISOString().slice(0, 16);
    setFormData({ ...formData, start_time: localISOTime });
  }

  function eventStyleGetter(event, start, end, isSelected) {
    let backgroundColor = '#3b82f6';
    if (event.status === 'Confirmed') backgroundColor = '#10b981';
    if (event.status === 'Cancelled') backgroundColor = '#ef4444';
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  }

  useEffect(() => {
    fetchInterviews();
  }, []);


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Interview Scheduling
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Schedule with {candidateName}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Column */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111827] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none transition-all group-hover:bg-primary/10"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><CalendarIcon className="w-5 h-5 text-primary"/> Your Availability</h2>
          
          <div className="h-[600px] relative z-10 custom-scrollbar calendar-premium">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="week"
            />
          </div>
        </div>

        {/* Form Column */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111827] shadow-xl relative overflow-hidden h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Video className="w-5 h-5 text-primary"/> New Invitation</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Interview Type</label>
              <select className="input-premium w-full px-4 py-3 rounded-xl text-sm appearance-none bg-white dark:bg-transparent" value={formData.interview_type} onChange={e => setFormData({...formData, interview_type: e.target.value})}>
                <option value="HR Screening">HR Screening</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Final Round">Final Round</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Meeting Platform</label>
              <select className="input-premium w-full px-4 py-3 rounded-xl text-sm appearance-none bg-white dark:bg-transparent" value={formData.meeting_mode} onChange={e => setFormData({...formData, meeting_mode: e.target.value})}>
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="In Person">In Person</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Start Time</label>
              <input required type="datetime-local" className="input-premium w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-transparent" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Duration (Minutes)</label>
              <select className="input-premium w-full px-4 py-3 rounded-xl text-sm appearance-none bg-white dark:bg-transparent" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Message to Candidate</label>
              <textarea className="input-premium w-full px-4 py-3 rounded-xl text-sm resize-none h-24" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Optional notes or instructions..." />
            </div>

            <button type="submit" disabled={loading || !formData.start_time} className="w-full btn-premium py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Invitation
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
};

export default RecruiterScheduling;
