import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Link2, Save, AlertCircle, CheckCircle2, UserCircle, Briefcase, Mail } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function CandidateProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    bio: '',
    github_url: '',
    linkedin_url: '',
    skills: '',
    experience: '',
    education: '',
    projects: '',
    certificates: '',
    avatar_url: ''
  });


  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    
    try {
      await api.put('/candidate/profile', formData);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Update failed' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/candidate/profile');
        setFormData({
          bio: res.data.bio || '',
          github_url: res.data.github_url || '',
          linkedin_url: res.data.linkedin_url || '',
          skills: res.data.skills || '',
          experience: res.data.experience || '',
          education: res.data.education || '',
          projects: res.data.projects || '',
          certificates: res.data.certificates || '',
          avatar_url: res.data.avatar_url || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="h-40 skeleton w-full"></div>
        <div className="h-96 skeleton w-full"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20 border border-white/10">
                {user?.name?.charAt(0) || 'C'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user?.name || 'Candidate'}</h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1 font-medium">
              <Mail className="w-4 h-4" /> {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="glass-card hover-3d rounded-3xl p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none transition-all group-hover:bg-primary/10"></div>
        
        <div className="mb-8 relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><UserCircle className="w-5 h-5 text-primary"/> Personal Information</h2>
          <p className="text-sm text-gray-500 mt-1">Update your professional profile and resume details.</p>
        </div>

        {status.message && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mb-8 p-4 rounded-2xl flex items-center gap-3 relative z-10 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{status.message}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Avatar URL</label>
              <input type="url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} className="input-premium w-full px-4 py-3 rounded-2xl text-sm" placeholder="https://example.com/avatar.jpg" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Professional Bio</label>
            <div className="relative">
              <div className="absolute top-3 left-4 pointer-events-none"><Briefcase className="w-5 h-5 text-gray-400" /></div>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="input-premium w-full pl-12 pr-4 py-3 rounded-2xl resize-none text-sm" placeholder="Tell us about your background..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">GitHub URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><GitBranch className="w-5 h-5 text-gray-400" /></div>
                <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} className="input-premium w-full pl-12 pr-4 py-3 rounded-2xl text-sm" placeholder="https://github.com/username" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">LinkedIn URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Link2 className="w-5 h-5 text-gray-400" /></div>
                <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="input-premium w-full pl-12 pr-4 py-3 rounded-2xl text-sm" placeholder="https://linkedin.com/in/username" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Portfolio URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Briefcase className="w-5 h-5 text-gray-400" /></div>
                <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} className="input-premium w-full pl-12 pr-4 py-3 rounded-2xl text-sm" placeholder="https://yourportfolio.com" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Skills (Comma Separated)</label>
            <textarea name="skills" value={formData.skills} onChange={handleChange} rows="2" className="input-premium w-full px-4 py-3 rounded-2xl resize-none text-sm" placeholder="React, Python, AWS..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Experience</label>
              <textarea name="experience" value={formData.experience} onChange={handleChange} rows="3" className="input-premium w-full px-4 py-3 rounded-2xl resize-none text-sm" placeholder="Software Engineer at Tech Corp (2020-2023)..." />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Education</label>
              <textarea name="education" value={formData.education} onChange={handleChange} rows="3" className="input-premium w-full px-4 py-3 rounded-2xl resize-none text-sm" placeholder="B.S. Computer Science, University of ABC..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Projects</label>
              <textarea name="projects" value={formData.projects} onChange={handleChange} rows="3" className="input-premium w-full px-4 py-3 rounded-2xl resize-none text-sm" placeholder="E-commerce App - Built with React & Node.js..." />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Certificates</label>
              <textarea name="certificates" value={formData.certificates} onChange={handleChange} rows="3" className="input-premium w-full px-4 py-3 rounded-2xl resize-none text-sm" placeholder="AWS Certified Solutions Architect..." />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-premium btn-3d px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
              Save Profile
            </button>
          </div>

        </form>
      </div>

    </motion.div>
  );
};

export default CandidateProfile;
