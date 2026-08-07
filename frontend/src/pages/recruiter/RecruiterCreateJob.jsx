import { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Building, MapPin, DollarSign, ChevronLeft, Loader2, Save, Type, ListPlus, Users, AlignLeft } from 'lucide-react';

function RecruiterCreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: 'Full-time',
    salary_range: '',
    description: '',
    required_skills: '',
    experience: '',
    openings: 1
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/recruiter/jobs', {
        ...formData,
        required_skills: formData.required_skills.split(',').map(s => s.trim())
      });
      navigate('/recruiter');
    } catch (err) {
      console.error(err);
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <button 
            onClick={() => navigate('/recruiter')} 
            className="p-3 bg-white dark:bg-[var(--surface)] border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Job Posting
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create New Role</h1>
            <p className="text-gray-500 font-medium mt-1">Define the requirements and details for your new open position.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card hover-3d rounded-3xl p-8 md:p-10 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none transition-all group-hover:bg-primary/10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Job Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Type className="w-5 h-5 text-gray-400" />
              </div>
              <input required type="text" className="input-premium w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Senior Machine Learning Engineer" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Department</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building className="w-5 h-5 text-gray-400" />
              </div>
              <input required type="text" className="input-premium w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Engineering" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <input required type="text" className="input-premium w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Remote, New York, NY" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Employment Type</label>
            <select className="input-premium w-full px-4 py-3.5 rounded-2xl text-sm appearance-none bg-white dark:bg-transparent" value={formData.employment_type} onChange={e => setFormData({...formData, employment_type: e.target.value})}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Salary Range</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input type="text" className="input-premium w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm" value={formData.salary_range} onChange={e => setFormData({...formData, salary_range: e.target.value})} placeholder="$120k - $150k" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Openings</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <input type="number" min="1" className="input-premium w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm" value={formData.openings} onChange={e => setFormData({...formData, openings: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Required Skills</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ListPlus className="w-5 h-5 text-gray-400" />
              </div>
              <input required type="text" className="input-premium w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} placeholder="e.g. React, Python, AWS (comma separated)" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Experience</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Briefcase className="w-5 h-5 text-gray-400" />
              </div>
              <input required type="text" className="input-premium w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 5+ years of software engineering" />
            </div>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Job Description</label>
          <div className="relative">
            <div className="absolute top-4 left-4 pointer-events-none">
              <AlignLeft className="w-5 h-5 text-gray-400" />
            </div>
            <textarea required className="input-premium w-full pl-12 pr-4 py-4 rounded-2xl text-sm resize-none h-48 custom-scrollbar" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Paste the comprehensive job description here..." />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-white/10 relative z-10">
          <button type="button" onClick={() => navigate('/recruiter')} className="px-8 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-premium btn-3d px-10 py-3.5 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RecruiterCreateJob;
