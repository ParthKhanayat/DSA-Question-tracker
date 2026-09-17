import React from 'react';
import { differenceInDays } from 'date-fns';
import { X, Sparkles } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

export const SmartRecommendationModal = ({ questions, onClose, onPing, onDelete, onUpdateDifficulty }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
          <h2><Sparkles size={24} style={{ color: 'var(--accent)', verticalAlign: 'middle', marginRight: '8px' }}/> Recommendation</h2>
          <p>No questions available to recommend yet. Add some questions first!</p>
        </div>
      </div>
    );
  }

  // Calculate score for each question
  const scoredQuestions = questions.map(q => {
    const diffDays = differenceInDays(new Date(), new Date(q.lastSolvedDate));
    const difficultyScore = (q.personalDifficulty || 5) * 5;
    const revisionPenalty = (q.revisionsCount || 0) * 8;
    const stalenessScore = diffDays * 1.5;
    
    const score = stalenessScore + difficultyScore - revisionPenalty;
    return { ...q, recommendationScore: score };
  });

  // Sort by score descending
  scoredQuestions.sort((a, b) => b.recommendationScore - a.recommendationScore);
  
  const recommendedQuestion = scoredQuestions[0];

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{
        position: 'relative', width: '90%', maxWidth: '500px', padding: '24px'
      }}>
        <button className="close-btn" onClick={onClose} style={{ 
          position: 'absolute', top: '16px', right: '16px', 
          background: 'transparent', border: 'none', color: 'var(--text)', 
          cursor: 'pointer' 
        }}>
          <X size={20} />
        </button>
        <h2 style={{ marginBottom: '16px', marginTop: 0 }}>
          <Sparkles size={24} style={{ color: 'var(--accent)', verticalAlign: 'middle', marginRight: '8px' }}/> 
          Smart Recommendation
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Based on how long it's been, your personal difficulty rating, and how many times you've revised this, we think you should tackle this next:
        </p>
        
        <QuestionCard 
          item={recommendedQuestion} 
          onPing={(id, dateStr, revs) => {
            onPing(id, dateStr, revs);
            onClose(); // Optional: close modal on ping
          }} 
          onDelete={onDelete} 
          onUpdateDifficulty={onUpdateDifficulty} 
        />
      </div>
    </div>
  );
};
