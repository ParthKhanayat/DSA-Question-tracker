import React from 'react';
import { differenceInDays } from 'date-fns';
import { X, Sparkles } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

export const SmartRecommendationModal = ({ questions, onClose, onPing, onDelete, onUpdateDifficulty }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="rainbow-border-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-inner">
            <button className="close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '16px', marginTop: 0, color: '#ffffff' }}>
              <Sparkles size={24} style={{ color: 'var(--accent)', verticalAlign: 'middle', marginRight: '8px' }}/> Recommendation
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>No questions available to recommend yet. Add some questions first!</p>
          </div>
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="rainbow-border-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-inner">
          <button className="close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
          <h2 style={{ marginBottom: '14px', marginTop: 0, color: '#ffffff' }}>
            <Sparkles size={24} style={{ color: 'var(--accent)', verticalAlign: 'middle', marginRight: '8px' }}/> 
            Smart Recommendation
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
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
    </div>
  );
};
