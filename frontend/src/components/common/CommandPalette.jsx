import { useState, useEffect } from 'react';
import { Search, Briefcase, Users, BrainCircuit, Code2, Map, Calendar, Settings, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    const handleOpenEvent = () => setIsOpen(true);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  const baseLinks = [
    { name: 'Profile Settings', path: '/dashboard/profile', icon: Settings },
  ];

  const candidateLinks = [
    { name: 'My Dashboard', path: '/dashboard', icon: FileText },
    { name: 'Resume AI', path: '/dashboard/resume', icon: FileText },
    { name: 'AI Interview', path: '/dashboard/interview', icon: BrainCircuit },
    { name: 'Coding Assessment', path: '/dashboard/coding', icon: Code2 },
    { name: 'Search Reports', path: '/dashboard/report', icon: Briefcase },
    { name: 'Search Learning Roadmap', path: '/dashboard/roadmap', icon: Map },
    { name: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
  ];

  const recruiterLinks = [
    { name: 'Recruiter Dashboard', path: '/recruiter', icon: Briefcase },
    { name: 'Search Candidates', path: '/recruiter/jobs/1/pipeline', icon: Users },
  ];

  const links = user?.role === 'recruiter' ? [...baseLinks, ...recruiterLinks] : [...baseLinks, ...candidateLinks];

  const filteredLinks = links.filter((link) => 
    link.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="bg-white dark:bg-[var(--surface)] w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-gray-200 dark:border-white/10"
          >
            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs text-gray-500 font-medium">ESC</div>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar p-2 bg-white/80 dark:bg-[var(--surface)]/80 backdrop-blur-xl">
              {filteredLinks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</div>
                  {filteredLinks.map((link, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(link.path)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium">{link.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
