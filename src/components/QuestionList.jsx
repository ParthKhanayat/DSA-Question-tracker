import React, { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { getFreshnessCategory, CategoryDetails } from '../utils/freshness';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

export const QuestionList = ({ questions, onPing, onDelete }) => {
  const [collapsed, setCollapsed] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40 }}>
        No questions tracked yet. Add one above!
      </div>
    );
  }

  const filteredQuestions = questions.filter(q => 
    q.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.id.toString().includes(searchQuery)
  );

  // Group questions by freshness
  const grouped = {
    ancient: [],
    stale: [],
    slipping: [],
    fresh: []
  };

  filteredQuestions.forEach(q => {
    const cat = getFreshnessCategory(q.lastSolvedDate);
    grouped[cat].push(q);
  });

  // Sort within groups: oldest first for everything so you know what needs revision most urgently
  const sortByOldest = (a, b) => new Date(a.lastSolvedDate) - new Date(b.lastSolvedDate);
  
  Object.keys(grouped).forEach(k => {
    grouped[k].sort(sortByOldest);
  });

  const categoriesOrder = ['ancient', 'stale', 'slipping', 'fresh'];

  const toggleCollapse = (catKey) => {
    setCollapsed(prev => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}>
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search tracked questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {filteredQuestions.length === 0 && searchQuery && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 20 }}>
          No questions match "{searchQuery}"
        </div>
      )}

      {categoriesOrder.map(catKey => {
        const items = grouped[catKey];
        if (items.length === 0) return null;
        
        const details = CategoryDetails[catKey];
        const isCollapsed = collapsed[catKey];

        return (
          <div key={catKey} className="category-section">
            <div 
              className="category-header" 
              onClick={() => toggleCollapse(catKey)}
              style={{ cursor: 'pointer' }}
              title={isCollapsed ? "Expand category" : "Collapse category"}
            >
              <div style={{ display: 'flex', alignItems: 'center', color: details.color }}>
                {isCollapsed ? <ChevronRight size={24} /> : <ChevronDown size={24} />}
              </div>
              <h2 className="category-title" style={{ color: details.color, margin: 0 }}>{details.label}</h2>
              <span className="category-count">{items.length}</span>
            </div>
            {!isCollapsed && (
              <div className="grid">
                {items.map(item => (
                  <QuestionCard key={item.id} item={item} onPing={onPing} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
