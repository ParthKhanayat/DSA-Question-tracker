import React, { useState, useEffect } from 'react';
import { QuestionInput } from './components/QuestionInput';
import { QuestionList } from './components/QuestionList';
import { Auth } from './components/Auth';
import { supabase } from './supabaseClient';
import { LogOut } from 'lucide-react';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchQuestions();
    } else {
      setQuestions([]);
      setIsLoaded(true);
    }
  }, [session]);

  const fetchQuestions = async () => {
    setIsLoaded(false);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      // Map db columns to app state format
      const formatted = data.map(q => ({
        id: q.question_id,
        name: q.name,
        lastSolvedDate: q.last_solved_date,
        db_id: q.id // Keep the serial/uuid from db just in case
      }));
      setQuestions(formatted);
    } catch (error) {
      console.error('Error fetching questions:', error.message);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleAddQuestion = async (newQuestion) => {
    // Optimistic UI update
    setQuestions(prev => {
      const exists = prev.findIndex(q => q.id === newQuestion.id || q.name.toLowerCase() === newQuestion.name.toLowerCase());
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists].lastSolvedDate = newQuestion.lastSolvedDate;
        return updated;
      }
      return [...prev, newQuestion];
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
            last_solved_date: newQuestion.lastSolvedDate
          }]);
      }
    } catch (error) {
      console.error('Error adding/updating question:', error.message);
      // In a real app, you might want to rollback the optimistic update on failure
    }
  };

  const handlePingQuestion = async (id, newDateStr) => {
    // Optimistic update
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, lastSolvedDate: newDateStr };
      }
      return q;
    }));

    try {
      await supabase
        .from('questions')
        .update({ last_solved_date: newDateStr })
        .eq('user_id', session.user.id)
        .eq('question_id', id);
    } catch (error) {
      console.error('Error pinging question:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isLoaded) return null;

  if (!session) {
    return <Auth onAuthComplete={setSession} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <button onClick={handleLogout} className="ping-btn" style={{ padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
        <h1>DSA Tracker</h1>
        <p>Log your LeetCode journey, track your revisions, and never forget a pattern.</p>
      </header>

      <main>
        <QuestionInput onAdd={handleAddQuestion} />
        
        <QuestionList 
          questions={questions} 
          onPing={handlePingQuestion} 
        />
      </main>
    </div>
  );
}

export default App;
