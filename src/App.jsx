import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuestionInput } from './components/QuestionInput';
import { QuestionList } from './components/QuestionList';
import { LeetCodeProgress } from './components/LeetCodeProgress';
import { Auth } from './components/Auth';
import { supabase } from './supabaseClient';
import { LogOut } from 'lucide-react';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const currentUserIdRef = useRef(null);

  const fetchQuestions = useCallback(async (userId) => {
    if (!userId) {
      setQuestions([]);
      setIsInitialLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Map db columns to app state format
      const formatted = data.map(q => ({
        id: q.question_id,
        name: q.name,
        lastSolvedDate: q.last_solved_date,
        difficulty: q.difficulty,
        personalDifficulty: q.personal_difficulty ?? 5,
        revisionsCount: q.revisions_count ?? 0,
        db_id: q.id // Keep the serial/uuid from db just in case
      }));
      setQuestions(formatted);
    } catch (error) {
      console.error('Error fetching questions:', error.message);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const userId = session?.user?.id;
      if (userId) {
        currentUserIdRef.current = userId;
        fetchQuestions(userId);
      } else {
        setIsInitialLoading(false);
      }
    });

    // Auth state subscription (triggered on sign in/out, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const newUserId = newSession?.user?.id;

      if (!newUserId) {
        currentUserIdRef.current = null;
        setQuestions([]);
        setIsInitialLoading(false);
        return;
      }

      // Only re-fetch if the user actually changed (e.g. login as different user).
      // Tab switches and window focus fire TOKEN_REFRESHED with the same user ID;
      // we must NOT re-fetch or reset UI state on those events!
      if (newUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = newUserId;
        fetchQuestions(newUserId);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchQuestions]);

  const handleAddQuestion = async (newQuestion) => {
    // Optimistic UI update
    setQuestions(prev => {
      const exists = prev.findIndex(q => q.id === newQuestion.id || q.name.toLowerCase() === newQuestion.name.toLowerCase());
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists].lastSolvedDate = newQuestion.lastSolvedDate;
        return updated;
      }
      return [...prev, { ...newQuestion, revisionsCount: 0, personalDifficulty: newQuestion.personalDifficulty || 5 }];
    });

    try {
      // Check if it exists in DB first
      const { data: existing } = await supabase
        .from('questions')
        .select('id')
        .eq('user_id', session.user.id)
        .or(`question_id.eq.${newQuestion.id},name.ilike.${newQuestion.name}`)
        .single();

      if (existing) {
        // Update
        await supabase
          .from('questions')
          .update({ last_solved_date: newQuestion.lastSolvedDate })
          .eq('id', existing.id);
      } else {
        // Insert
        await supabase
          .from('questions')
          .insert([{
            user_id: session.user.id,
            question_id: newQuestion.id,
            name: newQuestion.name,
            last_solved_date: newQuestion.lastSolvedDate,
            personal_difficulty: newQuestion.personalDifficulty || 5,
            revisions_count: 0
          }]);
      }
    } catch (error) {
      console.error('Error adding/updating question:', error.message);
      // In a real app, you might want to rollback the optimistic update on failure
    }
  };

  const handlePingQuestion = async (id, newDateStr, currentRevisions) => {
    // Optimistic update
    const newRevisions = currentRevisions + 1;
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, lastSolvedDate: newDateStr, revisionsCount: newRevisions };
      }
      return q;
    }));

    try {
      await supabase
        .from('questions')
        .update({ last_solved_date: newDateStr, revisions_count: newRevisions })
        .eq('user_id', session.user.id)
        .eq('question_id', id);
    } catch (error) {
      console.error('Error pinging question:', error.message);
    }
  };

  const handleUpdateDifficulty = async (id, newDifficulty) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, personalDifficulty: newDifficulty };
      }
      return q;
    }));

    try {
      await supabase
        .from('questions')
        .update({ personal_difficulty: newDifficulty })
        .eq('user_id', session.user.id)
        .eq('question_id', id);
    } catch (error) {
      console.error('Error updating difficulty:', error.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));

    try {
      await supabase
        .from('questions')
        .delete()
        .eq('user_id', session.user.id)
        .eq('question_id', id);
    } catch (error) {
      console.error('Error deleting question:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isInitialLoading) return null;

  if (!session) {
    return <Auth onAuthComplete={setSession} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-info">
          <h1>DSA Tracker</h1>
          <p>Log your LeetCode journey, track your revisions, and never forget a pattern.</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <main>
        <div className="top-dashboard">
          <div className="top-dashboard-input">
            <QuestionInput onAdd={handleAddQuestion} />
          </div>
          <div className="top-dashboard-meter">
            <LeetCodeProgress questions={questions} />
          </div>
        </div>
        
        <QuestionList 
          questions={questions} 
          onPing={handlePingQuestion} 
          onDelete={handleDeleteQuestion}
          onUpdateDifficulty={handleUpdateDifficulty}
        />
      </main>
    </div>
  );
}

export default App;
