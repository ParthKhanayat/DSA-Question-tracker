import React, { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { SmartRecommendationModal } from './SmartRecommendationModal';
import { getFreshnessCategory, CategoryDetails } from '../utils/freshness';
import { ChevronDown, ChevronRight, Search, Sparkles } from 'lucide-react';

export const QuestionList = ({ questions, onPing, onDelete, onUpdateDifficulty }) => {
  const categoriesOrder = ['ancient', 'stale', 'slipping', 'fresh'];
  
  // Requirement 1: By default collapse all categories, and remember user toggles during session
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = sessionStorage.getItem('dsa_collapsed_categories');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      ancient: true,
      stale: true,
      slipping: true,
      fresh: true
    };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40 }}>
        No questions tracked yet. Add one above!
      </div>
    );
  }

  const isSearching = searchQuery.trim().length > 0;

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

  const toggleCollapse = (catKey) => {
    setCollapsed(prev => {
      const next = {
        ...prev,
        [catKey]: !prev[catKey]
      };
      try {
        sessionStorage.setItem('dsa_collapsed_categories', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const allCollapsed = categoriesOrder.every(cat => !!collapsed[cat]);

  const toggleAll = () => {
    const nextState = !allCollapsed;
    const next = {
      ancient: nextState,
      stale: nextState,
      slipping: nextState,
      fresh: nextState
    };
    try {
      sessionStorage.setItem('dsa_collapsed_categories', JSON.stringify(next));
    } catch {
      // ignore
    }
    setCollapsed(next);
  };

  return (
    <div className="question-list-container">
      <div className="list-toolbar flex-between">
        <div className="search-input-wrapper">
          <div className="search-icon-holder">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search tracked questions by title or id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="toolbar-actions">
          <button 
            type="button"
            onClick={toggleAll}
            className="toggle-all-btn"
            title={allCollapsed ? "Expand all categories" : "Collapse all categories"}
          >
            {allCollapsed ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            <span>{allCollapsed ? "Expand All" : "Collapse All"}</span>
          </button>

          <button 
            onClick={() => setShowRecommendationModal(true)}
            className="recommend-btn"
          >
            <Sparkles size={16} />
            <span>What should I solve?</span>
          </button>
        </div>
      </div>

      {showRecommendationModal && (
        <SmartRecommendationModal 
          questions={questions} 
          onClose={() => setShowRecommendationModal(false)}
          onPing={onPing}
          onDelete={onDelete}
          onUpdateDifficulty={onUpdateDifficulty}
        />
      )}

      {filteredQuestions.length === 0 && searchQuery && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 24, padding: '24px 0' }}>
          No questions match "{searchQuery}"
        </div>
      )}

      {categoriesOrder.map(catKey => {
        const items = grouped[catKey];
        if (items.length === 0) return null;
        
        const details = CategoryDetails[catKey];
        // Auto-expand if user is actively searching, otherwise respect collapsed state
        const isCollapsed = isSearching ? false : !!collapsed[catKey];

        return (
          <div key={catKey} className="category-section">
            <div 
              className={`category-header ${isCollapsed ? 'is-collapsed' : 'is-expanded'}`}
              onClick={() => toggleCollapse(catKey)}
              title={isCollapsed ? "Click to expand" : "Click to collapse"}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCollapse(catKey);
                }
              }}
            >
              <div className="category-header-left">
                <div className="category-chevron" style={{ color: details.color }}>
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </div>
                <h2 className="category-title" style={{ color: details.color }}>{details.label}</h2>
                <span className="category-count">{items.length}</span>
              </div>
              <span className="category-status-hint">
                {isCollapsed ? 'Click to expand' : 'Click to collapse'}
              </span>
            </div>

            {!isCollapsed && (
              <div className="grid">
                {items.map(item => (
                  <QuestionCard key={item.id} item={item} onPing={onPing} onDelete={onDelete} onUpdateDifficulty={onUpdateDifficulty} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
