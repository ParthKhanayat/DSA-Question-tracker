import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar } from 'lucide-react';
import questionsData from '../data/questions.json';

export const QuestionInput = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Close suggestions if clicked outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    
    const qLower = query.toLowerCase();
    const filtered = questionsData.filter(q => 
      q.title.toLowerCase().includes(qLower) || 
      q.id.toString() === qLower
    ).slice(0, 10);
    
    setSuggestions(filtered);
  }, [query]);

  const handleAdd = (questionObj) => {
    const dateToUse = (showCustomDate && customDate) ? new Date(customDate).toISOString() : new Date().toISOString();
    
    onAdd({
      id: questionObj ? `lc-${questionObj.id}` : `custom-${Date.now()}`,
      name: questionObj ? `${questionObj.id}. ${questionObj.title}` : query.trim(),
      difficulty: questionObj ? questionObj.difficulty : null,
      lastSolvedDate: dateToUse,
      addedAt: new Date().toISOString()
    });
    
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setCustomDate('');
    setShowCustomDate(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (query.trim()) {
        handleAdd(null); // Add as custom
      }
    }
  };

  return (
    <div className="glass-panel add-form" ref={wrapperRef}>
      <div className="form-row">
        <div className="autocomplete-container">
          <input
            type="text"
            placeholder="Search LeetCode questions or type custom name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
          {showSuggestions && query.trim() !== '' && (
            <ul className="glass-panel suggestions-list">
              {suggestions.map(s => (
                <li 
                  key={s.id} 
                  className="suggestion-item"
                  onClick={() => handleAdd(s)}
                >
                  <span>{s.id}. {s.title}</span>
                  <span className={`difficulty-badge diff-${s.difficulty}`}>
                    {s.difficulty === 1 ? 'Easy' : s.difficulty === 2 ? 'Med' : 'Hard'}
                  </span>
                </li>
              ))}
              <li 
                className="suggestion-item" 
                style={{ fontStyle: 'italic', color: 'var(--accent)' }}
                onClick={() => handleAdd(null)}
              >
                + Add "{query}" as custom question
              </li>
            </ul>
          )}
        </div>
      </div>
      
      {showCustomDate && (
        <div className="form-row">
          <input 
            type="date" 
            value={customDate} 
            onChange={(e) => setCustomDate(e.target.value)} 
          />
        </div>
      )}
      
      <div className="flex-between">
        <span 
          className="custom-date-toggle"
          onClick={() => setShowCustomDate(!showCustomDate)}
        >
          <Calendar size={16} /> 
          {showCustomDate ? "Use today's date instead" : "Set custom solved date"}
        </span>
        
        <button onClick={() => query.trim() && handleAdd(null)}>
          <Plus size={18} /> Add
        </button>
      </div>
    </div>
  );
};
