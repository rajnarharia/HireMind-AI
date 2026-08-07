import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Bot, Code2, Sparkles, Target, FileText, CheckCircle2, Rocket, ArrowRight, BrainCircuit, 
  Zap, Cpu, Globe, Server, Cloud, Database, User
} from 'lucide-react';

// A 3D animated core component using framer-motion and CSS 3D transforms
const Animated3DCore = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] perspective-[1200px] flex items-center justify-center scale-75 md:scale-100">
      <motion.div
        animate={{
          rotateX: [0, 360],
          rotateY: [0, -360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-48 h-48 relative transform-style-3d"
      >
        {/* Glow behind cube */}
        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-150 animate-pulse"></div>
        
        {/* Cube faces - Adapts to light/dark */}
        <div className="absolute inset-0 border border-gray-300 dark:border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center" style={{ transform: 'translateZ(96px)' }}><Cpu className="w-16 h-16 text-gray-800 dark:text-white opacity-90"/></div>
        <div className="absolute inset-0 border border-gray-300 dark:border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center" style={{ transform: 'rotateY(180deg) translateZ(96px)' }}><BrainCircuit className="w-16 h-16 text-gray-800 dark:text-white opacity-90"/></div>
        <div className="absolute inset-0 border border-gray-300 dark:border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center" style={{ transform: 'rotateY(90deg) translateZ(96px)' }}><Bot className="w-16 h-16 text-gray-800 dark:text-white opacity-90"/></div>
        <div className="absolute inset-0 border border-gray-300 dark:border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center" style={{ transform: 'rotateY(-90deg) translateZ(96px)' }}><Code2 className="w-16 h-16 text-gray-800 dark:text-white opacity-90"/></div>
        <div className="absolute inset-0 border border-gray-300 dark:border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center" style={{ transform: 'rotateX(90deg) translateZ(96px)' }}><Sparkles className="w-16 h-16 text-gray-800 dark:text-white opacity-90"/></div>
        <div className="absolute inset-0 border border-gray-300 dark:border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center" style={{ transform: 'rotateX(-90deg) translateZ(96px)' }}><Target className="w-16 h-16 text-gray-800 dark:text-white opacity-90"/></div>
        
        {/* Inner Glowing Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary dark:bg-white rounded-full shadow-[0_0_50px_var(--color-primary),0_0_100px_rgba(37,99,235,0.5),0_0_150px_rgba(37,99,235,0.3)] dark:shadow-[0_0_50px_#fff,0_0_100px_rgba(255,255,255,0.8),0_0_150px_rgba(255,255,255,0.5)] animate-pulse"></div>
      </motion.div>
    </div>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);


  async function handleDemoLogin(role) {
    setDemoLoading(true);
    try {
      const email = role === 'recruiter' ? 'recruiter@demo.com' : 'candidate@demo.com';
      await login(email, 'demo123');
      navigate(role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (error) {
      console.error(error);
      alert("Demo login failed. Please ensure the backend seed script has been run.");
    } finally {
      setDemoLoading(false);
    }
  }

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };


  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] dark:mix-blend-screen opacity-70 dark:opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px] dark:mix-blend-screen opacity-70 dark:opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[120px] dark:mix-blend-screen opacity-60 dark:opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 mix-blend-overlay"></div>
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Modern Floating Navbar */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 transition-all duration-500 rounded-full ${scrolled ? 'bg-background/90 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_50px_-15px_var(--color-primary)] py-3 px-6' : 'bg-transparent py-4 px-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('platform')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              <span className="font-black text-xl text-white relative z-10">H</span>
            </div>
            <span className="text-xl font-black tracking-tight hidden sm:block text-foreground">HireMind<span className="text-primary">.ai</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
            <button onClick={() => scrollTo('platform')} className="hover:text-primary transition-colors">Platform</button>
            <button onClick={() => scrollTo('features')} className="hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-primary transition-colors">Pricing</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden sm:block">Sign In</button>
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section id="platform" className="pt-40 pb-20 px-6 lg:pt-52 lg:pb-32 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium mb-8 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" /> 
            <span className="text-gray-700 dark:text-gray-300">Introducing HireMind 2.0</span>
            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 mx-1"></span>
            <a href="#" className="text-primary hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">Read announcement <ArrowRight className="w-3 h-3"/></a>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 max-w-5xl leading-[1.1] text-gray-900 dark:text-white"
          >
            Hire the best.<br/>
            <span className="text-gradient">Zero friction.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-12 font-medium"
          >
            The world's first autonomous AI hiring platform. From resume parsing to live technical interviews, hire 10x faster with absolute precision.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button onClick={() => handleDemoLogin('recruiter')} className="px-8 py-4 btn-custom-theme btn-3d text-white font-black rounded-full hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 w-full sm:w-auto justify-center text-lg">
              <Rocket className="w-5 h-5 text-white" /> Live Recruiter Demo
            </button>
            <button onClick={() => handleDemoLogin('candidate')} className="px-8 py-4 bg-white dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/20 backdrop-blur-md border border-gray-200 dark:border-white/10 btn-3d flex items-center gap-2 w-full sm:w-auto justify-center text-lg shadow-sm">
              <User className="w-5 h-5" /> Try Candidate Flow
            </button>
          </motion.div>

            <Animated3DCore />
        </section>

        {/* Logos */}
        <section className="py-10 border-y border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Powering the next generation of teams</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 text-gray-900 dark:text-white">
              <Globe className="w-8 h-8" />
              <Cpu className="w-8 h-8" />
              <Server className="w-8 h-8" />
              <Database className="w-8 h-8" />
              <Cloud className="w-8 h-8" />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">A completely new way to hire.</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">We rebuilt the ATS from the ground up, infusing AI into every step of the funnel to eliminate bias and save hundreds of hours.</p>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: <FileText className="w-6 h-6 text-blue-400" />,
                  title: "Semantic Resume Parsing",
                  desc: "Stop relying on keyword matching. Our LLM understands the deep context of experience, side projects, and impact.",
                  bg: "from-blue-500/10 to-transparent"
                },
                {
                  icon: <Bot className="w-6 h-6 text-purple-400" />,
                  title: "Adaptive Voice Interviews",
                  desc: "Our AI conducts initial technical screens, probing deeper on weak answers and adapting dynamically.",
                  bg: "from-purple-500/10 to-transparent"
                },
                {
                  icon: <Code2 className="w-6 h-6 text-green-400" />,
                  title: "Code Execution Environment",
                  desc: "Live algorithmic assessments with instant big-O analysis, hidden test cases, and edge-case detection.",
                  bg: "from-green-500/10 to-transparent"
                },
                {
                  icon: <BrainCircuit className="w-6 h-6 text-yellow-400" />,
                  title: "Skill Gap Analysis",
                  desc: "Visualize exact matches and mismatches against your job description on a granular, technical level.",
                  bg: "from-yellow-500/10 to-transparent"
                },
                {
                  icon: <Zap className="w-6 h-6 text-cyan-400" />,
                  title: "RAG HR Copilot",
                  desc: "Chat with your pipeline. 'Who is the best frontend dev we saw last week?' and get instant, cited answers.",
                  bg: "from-cyan-500/10 to-transparent"
                },
                {
                  icon: <Target className="w-6 h-6 text-rose-400" />,
                  title: "Hiring Reports",
                  desc: "Comprehensive dossiers generated post-interview, offering a clear 'Hire' or 'Reject' recommendation.",
                  bg: "from-rose-500/10 to-transparent"
                }
              ].map((f, i) => (
                <motion.div key={i} variants={fadeInUp} className="group relative hover-3d">
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl`}></div>
                  <div className="relative h-full bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-8 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center mb-6 shadow-sm">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{f.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-6 bg-gray-50 dark:bg-black relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">Simple, transparent pricing.</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Scale your engineering team without scaling your HR headcount.</p>
            </div>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {[
                {
                  tier: "Pro",
                  price: "$299",
                  desc: "For growing startups building their core team.",
                  features: ["Unlimited Active Jobs", "500 AI Interviews / mo", "Coding Environment", "Slack Integration"],
                  primary: false
                },
                {
                  tier: "Enterprise",
                  price: "Custom",
                  desc: "For scale-ups and enterprises with high volume.",
                  features: ["Custom LLM Models", "Unlimited Interviews", "Dedicated Success Manager", "SSO & Advanced RBAC"],
                  primary: true
                }
              ].map((p, i) => (
                <motion.div key={i} variants={fadeInUp} className={`rounded-3xl p-10 border hover-3d ${p.primary ? 'bg-gradient-to-b from-primary/10 dark:from-primary/20 to-secondary/5 dark:to-secondary/10 border-primary/50 relative overflow-hidden shadow-2xl shadow-primary/20 transition-all duration-500' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm'}`}>
                  {p.primary && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 blur-[50px]"></div>}
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{p.tier}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-black text-gray-900 dark:text-white">{p.price}</span>
                    {p.price !== "Custom" && <span className="text-gray-500 dark:text-gray-400">/mo</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 h-12">{p.desc}</p>
                  <ul className="space-y-4 mb-10">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 rounded-xl font-bold transition-all btn-3d ${p.primary ? 'btn-custom-theme text-white shadow-lg shadow-primary/20' : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10'}`}>
                    {p.primary ? 'Contact Sales' : 'Start Free Trial'}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary to-secondary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-white/20 shadow-2xl shadow-primary/20 hover-3d">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10 tracking-tight text-white">Ready to build your dream team?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 relative z-10 font-medium">
              Join the most innovative companies using AI to identify and hire top talent.
            </p>
            <div className="flex justify-center relative z-10">
              <button onClick={() => navigate('/register')} className="px-10 py-5 bg-white text-gray-900 font-black rounded-full transition-transform flex items-center gap-3 text-lg shadow-xl shadow-black/20 btn-3d">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-white/10 py-12 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm shadow-md">H</div>
              <span className="font-bold text-gray-900 dark:text-white tracking-tight">HireMind AI</span>
            </div>
            <div className="text-sm font-medium text-gray-500">© 2026 HireMind, Inc. All rights reserved.</div>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default LandingPage;
