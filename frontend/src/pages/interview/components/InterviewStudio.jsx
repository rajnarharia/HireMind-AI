import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Sparkles, Clock, Activity, CheckCircle, ArrowRight, Home, Loader2 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import TypingText from './TypingText';

// Polyfill for SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function InterviewStudio({ interview, isProcessing, onSubmitAnswer, onExit }) {
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 mins per question
  
  const recognitionRef = useRef(null);
  
  // Find current active question
  const currentQIndex = interview.questions.findIndex(q => !q.answer);
  const currentQuestion = currentQIndex !== -1 ? interview.questions[currentQIndex] : null;
  const isCompleted = interview.status === 'completed';
  const progress = isCompleted ? 100 : Math.round((currentQIndex / interview.questions.length) * 100);

  // Confidence metric based on input length
  const wordCount = answerText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const confidence = Math.min(Math.max((wordCount / 50) * 100, 10), 98);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setAnswerText(prev => prev + (prev.endsWith(' ') ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isCompleted || isProcessing || isAISpeaking || !currentQuestion) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted, isProcessing, isAISpeaking, currentQuestion]);

  // AI Voice Synthesis (TTS)
  useEffect(() => {
    if (hasStarted && currentQuestion && window.speechSynthesis) {
      setIsAISpeaking(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question_text);
      // Try to find a premium voice
      const voices = window.speechSynthesis.getVoices();
      const goodVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Natural')));
      if (goodVoice) utterance.voice = goodVoice;
      
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      
      utterance.onend = () => setIsAISpeaking(false);
      utterance.onerror = () => setIsAISpeaking(false);
      
      // Delay speech slightly for "thinking" animation effect
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 1000);
    }
    
    // Reset timer when question changes
    setTimeRemaining(120);
    setAnswerText('');
    
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, [currentQuestion?.id, hasStarted]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setAnswerText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    onSubmitAnswer(currentQuestion.id, answerText);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isCompleted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-8 p-10 z-10 relative text-center">
        <div className="absolute inset-0 bg-primary/5 rounded-[40px] blur-3xl -z-10"></div>
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50 text-white"
        >
          <CheckCircle className="w-16 h-16" />
        </motion.div>
        
        <h1 className="text-5xl font-black text-gray-900 dark:text-white">Interview Complete</h1>
        <p className="text-gray-500 text-lg max-w-lg">The AI has analyzed your responses. Generating your final evaluation report...</p>
        
        <div className="glass-card hover-3d px-8 py-6 rounded-3xl flex items-center gap-6 mt-8">
          <div className="text-left">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Final Score</p>
            <p className="text-5xl font-black text-primary">{interview.overall_score || 0}<span className="text-xl text-gray-400">/100</span></p>
          </div>
          <div className="h-16 w-px bg-gray-200 dark:bg-white/10"></div>
          <button onClick={onExit} className="btn-premium btn-3d px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            Return to Dashboard <Home className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  if (!hasStarted && !isCompleted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-8 p-10 z-10 relative text-center">
        <div className="absolute inset-0 bg-primary/5 rounded-[40px] blur-3xl -z-10"></div>
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 text-white"
        >
          <Sparkles className="w-16 h-16" />
        </motion.div>
        
        <h1 className="text-5xl font-black text-gray-900 dark:text-white">Ready for your Interview?</h1>
        <p className="text-gray-500 text-lg max-w-lg">The AI Engineer will ask you a series of questions. You can respond using your microphone or by typing.</p>
        
        <div className="flex gap-4 mt-8">
          <button onClick={() => setHasStarted(true)} className="btn-premium btn-3d px-8 py-4 rounded-xl font-bold flex items-center gap-2 text-lg transition-all hover:scale-105 shadow-xl shadow-primary/20">
            Start Interview <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={onExit} className="bg-gray-200 hover:bg-gray-300 dark:bg-white/5 dark:hover:bg-white/10 px-8 py-4 rounded-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white transition-all btn-3d">
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full w-full max-w-7xl mx-auto flex flex-col z-10 relative">
      
      {/* HUD Header */}
      <header className="flex items-center justify-between p-6 glass-card hover-3d rounded-b-3xl md:rounded-3xl shadow-lg border-t-0 md:mt-4 mb-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Question {currentQIndex + 1} of {interview.questions.length}</span>
          </div>
          <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner hidden md:block">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <span className={`font-mono font-bold ${timeRemaining < 30 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{formatTime(timeRemaining)}</span>
          </div>
          <button onClick={onExit} className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg">
            Exit
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* AI Avatar & Question Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Avatar Area */}
          <div className="glass-card hover-3d rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden flex-1 group">
             <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
             
             {/* Dynamic Orb */}
             <div className="relative w-48 h-48 flex items-center justify-center">
                {isProcessing ? (
                  <>
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-accent/30 rounded-full blur-2xl"></motion.div>
                    <Loader2 className="w-12 h-12 text-accent animate-spin relative z-10" />
                  </>
                ) : isAISpeaking ? (
                  <>
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"></motion.div>
                    <AudioVisualizer isActive={true} color="bg-white" />
                  </>
                ) : (
                  <>
                    <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute inset-0 bg-gray-500/20 rounded-full blur-xl"></motion.div>
                    <Sparkles className="w-10 h-10 text-gray-400 relative z-10" />
                  </>
                )}
             </div>

             <div className="mt-8 text-center relative z-10">
               <h3 className="font-bold text-gray-900 dark:text-white tracking-wide">AI Engineer</h3>
               <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">
                 {isProcessing ? 'Analyzing response...' : isAISpeaking ? 'Speaking' : 'Listening'}
               </p>
             </div>
          </div>

          {/* Real-time Confidence Metric */}
          <div className="glass-card hover-3d rounded-3xl p-6 relative overflow-hidden">
             <div className="flex justify-between items-end mb-2">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-4 h-4 text-primary" /> Confidence Level
               </span>
               <span className="text-sm font-black text-gray-900 dark:text-white">{Math.round(confidence)}%</span>
             </div>
             <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${confidence > 70 ? 'bg-emerald-500' : confidence > 40 ? 'bg-yellow-500' : 'bg-primary'}`}
                  animate={{ width: `${confidence}%` }} 
                  transition={{ type: "spring", stiffness: 100 }}
                />
             </div>
          </div>
        </div>

        {/* Conversation & Input Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-h-0">
           
           {/* Current Question */}
           <div className="glass-card hover-3d rounded-3xl p-8 bg-gradient-to-br from-white to-gray-50 dark:from-[#111827] dark:to-[#0A0D14] border-t-primary/30 shadow-2xl relative">
             <div className="absolute top-4 left-8 text-[120px] font-black text-primary/5 leading-none pointer-events-none font-serif">Q</div>
             <div className="relative z-10">
               <h2 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white leading-relaxed">
                 {currentQuestion ? (
                   <TypingText text={currentQuestion.question_text} speed={20} />
                 ) : "Preparing next question..."}
               </h2>
             </div>
           </div>

           {/* Input Console */}
           <div className="glass-card hover-3d rounded-3xl p-2 flex-1 flex flex-col relative overflow-hidden bg-white/60 dark:bg-[var(--surface)]/60">
             
             {isRecording && (
               <div className="absolute inset-0 bg-red-500/5 pointer-events-none z-0"></div>
             )}

             <textarea
               value={answerText}
               onChange={(e) => setAnswerText(e.target.value)}
               disabled={isProcessing}
               placeholder={isRecording ? "Listening... Speak clearly." : "Type your answer or use the microphone..."}
               className={`flex-1 w-full bg-transparent border-none focus:ring-0 resize-none p-6 text-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none custom-scrollbar relative z-10 ${isRecording ? 'animate-pulse text-red-500 dark:text-red-400' : ''}`}
             />

             {/* Action Bar */}
             <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5 relative z-10 bg-white/50 dark:bg-black/20 rounded-2xl mx-2 mb-2 backdrop-blur-md">
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isRecording 
                        ? 'bg-red-500 text-white shadow-red-500/40 hover:bg-red-600 hover:scale-105' 
                        : 'bg-white dark:bg-[#1A1D24] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {isRecording && <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></span>}
                    {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-6 h-6" />}
                  </button>
                  {isRecording && <AudioVisualizer isActive={true} color="bg-red-500" />}
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isProcessing || !answerText.trim()}
                  className="btn-premium btn-3d px-8 py-4 rounded-xl font-black text-lg tracking-wider flex items-center gap-3 disabled:opacity-50 transition-all hover:pr-6 group"
                >
                  {isProcessing ? 'ANALYZING...' : 'SUBMIT'}
                  {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
             </div>
           </div>

        </div>
      </div>
    </motion.div>
  );
}
