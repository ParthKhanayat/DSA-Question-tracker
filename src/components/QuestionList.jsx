import React from 'react';
import { QuestionCard } from './QuestionCard';
import { getFreshnessCategory, CategoryDetails } from '../utils/freshness';

export const QuestionList = ({ questions, onPing, onDelete }) => {
  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40 }}>
        No questions tracked yet. Add one above!
      </div>
    );
  }

  // Group questions by freshness
  const grouped = {
    ancient: [],
    stale: [],
    slipping: [],
    fresh: []
  };

  questions.forEach(q => {
    const cat = getFreshnessCategory(q.lastSolvedDate);
    grouped[cat].push(q);
  });

  // Sort within groups: oldest first for everything so you know what needs revision most urgently
  const sortByOldest = (a, b) => new Date(a.lastSolvedDate) - new Date(b.lastSolvedDate);
  
  Object.keys(grouped).forEach(k => {
    grouped[k].sort(sortByOldest);
  });

  const categoriesOrder = ['ancient', 'stale', 'slipping', 'fresh'];

  return (
    <div>
      {categoriesOrder.map(catKey => {
        const items = grouped[catKey];
        if (items.length === 0) return null;
        
        const details = CategoryDetails[catKey];

        return (
          <div key={catKey} className="category-section">
            <div className="category-header">
              <h2 className="category-title" style={{ color: details.color }}>{details.label}</h2>
              <span className="category-count">{items.length}</span>
            </div>
            <div className="grid">
              {items.map(item => (
                <QuestionCard key={item.id} item={item} onPing={onPing} onDelete={onDelete} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
