import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { RefreshCw, Trash2 } from 'lucide-react';
import { getFreshnessCategory } from '../utils/freshness';
import { getQuestionDifficulty } from '../utils/difficulty';

export const QuestionCard = ({ item, onPing, onDelete, onUpdateDifficulty }) => {
  const categoryId = getFreshnessCategory(item.lastSolvedDate);
  const solvedDate = new Date(item.lastSolvedDate);
  const diffDays = differenceInDays(new Date(), solvedDate);
  const diffInfo = getQuestionDifficulty(item);
  
  const handlePing = () => {
    // Set custom ping date to today easily, but we can also use custom date logic outside.
    // For simplicity, ping just means "I solved it today"
    onPing(item.id, new Date().toISOString(), item.revisionsCount || 0);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      onDelete(item.id);
    }
  };

  return (
    <div className={`glass-panel question-card card-${categoryId}`}>
      <div className="card-header">
        <h3 className="card-title" title={item.name}>{item.name}</h3>
        {diffInfo && (
          <span className={`difficulty-badge diff-${diffInfo.level}`}>
            {diffInfo.label}
          </span>
        )}
      </div>

      <div className="card-meta-row">
        <span className="card-date-info">
          Solved: {format(solvedDate, 'MMM d, yyyy')}
        </span>
        <span className="card-relative-time">
          {diffDays === 0 ? 'Today' : `${diffDays}d ago`}
        </span>
      </div>

      <div className="card-diff-row">
        <div className="card-slider-wrap" title={`Personal Difficulty: ${item.personalDifficulty || 5}/10`}>
          <span className="card-slider-label">Diff: {item.personalDifficulty || 5}/10</span>
          <input 
            type="range" 
            min="1" max="10" 
            value={item.personalDifficulty || 5} 
            onChange={(e) => onUpdateDifficulty(item.id, parseInt(e.target.value, 10))}
            className="compact-slider"
          />
        </div>
        <span className="card-rev-badge">
          Rev: {item.revisionsCount || 0}
        </span>
      </div>

      <div className="card-actions">
        <button className="ping-btn compact-ping-btn" onClick={handlePing} title="I revised/solved this today">
          <RefreshCw size={13} />
          <span>Ping</span>
        </button>
        <button 
          className="compact-delete-btn" 
          onClick={handleDelete} 
          title="Delete question"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
