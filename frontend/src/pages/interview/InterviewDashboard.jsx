import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import InterviewLobby from './components/InterviewLobby';
import InterviewStudio from './components/InterviewStudio';
import { Loader2 } from 'lucide-react';

export default function InterviewDashboard() {
  const [resumes, setResumes] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeInterview, setActiveInterview] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  async function fetchData() {
    try {
      const [resRes, histRes] = await Promise.all([
        api.get('/resume/history'),
        api.get('/interview/history')
      ]);
      setResumes(resRes.data);
      setHistory(histRes.data);
      
      const inProgress = histRes.data.find(i => i.status === 'in_progress');
      if (inProgress) {
        await loadInterview(inProgress.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadInterview(id) {
    setIsLoading(true);
    try {
      const res = await api.get(`/interview/${id}`);
      setActiveInterview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function startInterview(resumeId) {
    setIsProcessing(true);
    try {
      const res = await api.post('/interview/start', {
        resume_id: resumeId,
        target_role: "Software Engineer"
      });
      setActiveInterview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function submitAnswer(questionId, answerText) {
    if (!answerText.trim() || !activeInterview) return;
    
    setIsProcessing(true);
    try {
      await api.post(`/interview/${activeInterview.id}/question/${questionId}/answer`, {
        answer_text: answerText
      });
      
      const updatedRes = await api.get(`/interview/${activeInterview.id}`);
      setActiveInterview(updatedRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  const exitStudio = () => {
    setActiveInterview(null);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Initializing Cognitive Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] w-full overflow-hidden flex flex-col relative bg-transparent">
      <AnimatePresence mode="wait">
        {!activeInterview ? (
          <InterviewLobby 
            key="lobby"
            resumes={resumes}
            history={history}
            isProcessing={isProcessing}
            onStart={startInterview}
            onLoad={loadInterview}
          />
        ) : (
          <InterviewStudio 
            key="studio"
            interview={activeInterview}
            isProcessing={isProcessing}
            onSubmitAnswer={submitAnswer}
            onExit={exitStudio}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
