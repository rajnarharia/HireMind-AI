import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Settings, LogOut, Menu, X, ChevronLeft, Sun, Moon,
  FileText, BrainCircuit, Code2, Briefcase, Map, Calendar,
  Sparkles, Search, User
} from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume AI', href: '/dashboard/resume', icon: FileText },
    { name: 'Interviews', href: '/dashboard/interview', icon: BrainCircuit },
    { name: 'Coding', href: '/dashboard/coding', icon: Code2 },
    { name: 'Reports', href: '/dashboard/report', icon: Briefcase },
    { name: 'Roadmap', href: '/dashboard/roadmap', icon: Map },
    { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
    { name: 'Copilot', href: '/dashboard/copilot', icon: Sparkles },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex overflow-hidden transition-colors duration-300">
      
      {/* Sidebar - Desktop (Linear Style) */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 70 }}
        className="hidden md:flex flex-col bg-[var(--surface)] border-r border-gray-200 dark:border-white/5 z-30 transition-all duration-300 relative"
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-transparent">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap mt-2">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-black dark:bg-white flex items-center justify-center shadow-lg">
              <span className="font-black text-white dark:text-black">H</span>
            </div>
            {sidebarOpen && <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">HireMind</span>}
          </div>
        </div>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-full p-1.5 shadow-sm hover:scale-110 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 hover:text-primary transition-all z-40 text-gray-500 dark:text-gray-400"
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
            <ChevronLeft className="w-3 h-3" />
          </motion.div>
        </button>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {sidebarOpen && <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidate Space</div>}
          
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gray-200/50 dark:bg-white/10 text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary dark:text-white' : 'text-gray-500'}`} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="truncate text-sm"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/5">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="ml-3">Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 w-full z-40 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
               <span className="font-black text-white dark:text-black">H</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">HireMind</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 pt-16 bg-[var(--surface)]"
          >
            <div className="p-4 space-y-2 overflow-y-auto h-full pb-20">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                      isActive ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" /> {item.name}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 mt-4">
                <LogOut className="w-5 h-5" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--background)] overflow-hidden rounded-tl-3xl md:border-l md:border-t md:border-gray-200 md:dark:border-white/5 md:mt-2 shadow-2xl shadow-black/5 dark:shadow-none">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-transparent sticky top-0 z-50">
          
          <div className="flex items-center gap-3 bg-white dark:bg-[#111827] rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-white/5 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all group shadow-sm" onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}>
            <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              readOnly
              className="bg-transparent border-none outline-none text-sm w-32 sm:w-64 text-gray-900 dark:text-white placeholder-gray-400 cursor-pointer pointer-events-none"
            />
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
              <span>Ctrl</span><span>K</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <NotificationDropdown />
            
            <div className="relative group">
              <div 
                className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent p-0.5 ml-2 cursor-pointer"
                onClick={() => {
                  const menu = document.getElementById('profile-dropdown');
                  if (menu) menu.classList.toggle('hidden');
                }}
              >
                <div className="h-full w-full rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              
              <div id="profile-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-[#111827] rounded-xl shadow-xl py-2 border border-gray-200 dark:border-white/10 z-50">
                <button onClick={() => navigate('/dashboard/profile')} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300">Profile Settings</button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium">Log out</button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full relative z-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;