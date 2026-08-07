import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { User as UserIcon, Plus, MessageSquare, Trash2, Sparkles, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function StreamText({ content }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(content.slice(0, i));
      i += 3; // Speed of streaming
      if (i > content.length) {
        setDisplayedText(content);
        clearInterval(interval);
      }
    }, 10);
    return () => clearInterval(interval);
  }, [content]);

  return (
    <ReactMarkdown
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-xl my-4 text-sm" {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
}

function StaticMarkdown({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-xl my-4 text-sm" {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CopilotChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);


  async function fetchChats() {
    try {
      const res = await api.get('/copilot/chats');
      setChats(res.data);
      if (res.data.length > 0 && !activeChat) {
        setActiveChat(res.data[0]);
        setMessages(res.data[0].messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function createNewChat() {
    try {
      const res = await api.post('/copilot/chats');
      setChats([res.data, ...chats]);
      setActiveChat(res.data);
      setMessages([]);
      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteChat(id, e) {
    e.stopPropagation();
    try {
      await api.delete(`/copilot/chats/${id}`);
      setChats(chats.filter(c => c.id !== id));
      if (activeChat?.id === id) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    let chatId = activeChat?.id;
    if (!chatId) {
      const res = await api.post('/copilot/chats');
      chatId = res.data.id;
      setActiveChat(res.data);
      setChats([res.data, ...chats]);
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/copilot/chats/${chatId}/message`, { content: userMessage.content });
      setMessages(prev => [...prev, res.data]);
      fetchChats();
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function loadChat(chat) {
    setActiveChat(chat);
    setMessages(chat.messages || []);
    if (inputRef.current) inputRef.current.focus();
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const welcomeMessage = user?.role === 'recruiter' 
    ? "I'm your HR AI Copilot. I can search through your candidate pool, summarize resumes, analyze skill gaps, and recommend who to interview. Ask me anything."
    : "I'm your Career AI Copilot. I can help you prepare for interviews, explain technical concepts, or guide you through your learning roadmap.";


  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-3xl overflow-hidden glass-card hover-3d border-0 shadow-2xl relative bg-white/50 dark:bg-[#0A0D14]/80">
      
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-900 dark:text-white hover:border-primary/50 transition-colors group"
          >
            <span>New Chat</span>
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          <AnimatePresence>
            {chats.map(chat => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={chat.id} 
                onClick={() => loadChat(chat)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all group flex items-center justify-between cursor-pointer ${
                  activeChat?.id === chat.id 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${activeChat?.id === chat.id ? 'text-primary' : 'text-gray-400'}`} />
                  <span className="truncate">{chat.title || 'New Conversation'}</span>
                </div>
                <button 
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white dark:hover:bg-black/50 rounded-lg text-gray-400 hover:text-red-500 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {chats.length === 0 && (
            <div className="text-center p-4 text-xs font-medium text-gray-500 mt-4">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-transparent">
        
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-accent/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Header (Mobile) */}
        <div className="md:hidden p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-md relative z-10">
          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Copilot
          </div>
          <button onClick={createNewChat} className="p-2 bg-primary/10 text-primary rounded-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8 relative z-10 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4 animate-in fade-in duration-700">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8 border border-primary/20 relative shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <Sparkles className="w-10 h-10 text-primary relative z-10" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">How can I help you today?</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed max-w-lg mb-10">{welcomeMessage}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[
                  "Summarize the top 3 candidates for Frontend Engineer",
                  "What skills are missing for the Backend role?",
                  "Write a personalized rejection email",
                  "Compare candidate A and B's coding rounds"
                ].map((prompt, i) => (
                  <button key={i} onClick={() => setInput(prompt)} className="p-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-left transition-all group flex flex-col justify-between h-24">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{prompt}</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors self-end" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 pb-10">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={i} 
                  className={`flex gap-6 group/msg ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-black' 
                      : 'bg-gradient-to-br from-primary to-accent text-white border border-white/10'
                  }`}>
                    {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  
                  <div className={`flex-1 overflow-hidden flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`prose prose-sm md:prose-base dark:prose-invert max-w-full px-6 py-4 rounded-3xl ${
                      msg.role === 'user' 
                        ? 'bg-gray-100 dark:bg-[#1A1D24] text-gray-900 dark:text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-none shadow-sm dark:shadow-none rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' && i === messages.length - 1 ? (
                        <StreamText content={msg.content} />
                      ) : (
                        <StaticMarkdown content={msg.content} />
                      )}
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 mt-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm"
                          title="Copy message"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                        {i === messages.length - 1 && (
                          <button 
                            onClick={async () => {
                              const lastUserMsg = messages[i - 1];
                              if (!lastUserMsg) return;
                              setMessages(messages.slice(0, -1));
                              setLoading(true);
                              try {
                                const res = await api.post(`/copilot/chats/${activeChat.id}/message`, { content: lastUserMsg.content });
                                setMessages(prev => [...prev.slice(0, -1), res.data]);
                              } catch(e) {
                                setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Regeneration failed.' }]);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-black/20 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm"
                            title="Regenerate response"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6">
                  <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white border border-white/10 shadow-lg">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="px-6 py-4 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2.5 h-2.5 bg-primary/60 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 bg-primary/60 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 bg-primary/60 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-transparent relative z-20">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={sendMessage} className="relative group">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Ask Copilot anything..."
                className="w-full pl-6 pr-16 py-5 bg-white dark:bg-[var(--surface)] border border-gray-300 dark:border-white/10 rounded-3xl text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-xl resize-none min-h-[72px] max-h-48 custom-scrollbar transition-all"
                rows="1"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-3 top-3 p-2.5 bg-primary text-white rounded-2xl hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-lg shadow-primary/20"
              >
                <CornerDownLeft className="w-5 h-5" />
              </button>
            </form>
            <div className="text-center mt-3 text-[11px] font-medium text-gray-400">
              AI Copilot can make mistakes. Check important information.
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CopilotChat;
