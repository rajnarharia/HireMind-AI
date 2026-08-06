import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      // For demo purposes if empty, provide a mock notification
      if (res.data.length === 0) {
        setNotifications([{
          id: 'demo-1',
          title: 'Welcome to HireMind AI 2.0',
          message: 'Explore the new premium dashboard and features.',
          is_read: false,
          created_at: new Date().toISOString()
        }]);
      } else {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Close on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    if(id.toString().startsWith('demo')) {
      setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
      return;
    }
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    if(id.toString().startsWith('demo')) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      return;
    }
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    } catch (err) {
      // Mock update if it fails or it's demo data
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200 dark:border-white/10"
          >
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  <AnimatePresence>
                    {notifications.map((notif) => (
                      <motion.div 
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group relative ${!notif.is_read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="mt-1">
                            {!notif.is_read ? (
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 border border-gray-300 dark:border-gray-600"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{notif.title}</p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.is_read && (
                              <button onClick={(e) => markAsRead(notif.id, e)} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Mark as read">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={(e) => deleteNotification(notif.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
