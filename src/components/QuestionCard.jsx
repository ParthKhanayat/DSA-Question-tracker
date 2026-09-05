import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { RefreshCw, Trash2 } from 'lucide-react';
import { getFreshnessCategory } from '../utils/freshness';
import { getQuestionDifficulty } from '../utils/difficulty';

export const QuestionCard = ({ item, onPing, onDelete }) => {
  const categoryId = getFreshnessCategory(item.lastSolvedDate);
  const solvedDate = new Date(item.lastSolvedDate);
  const diffDays = differenceInDays(new Date(), solvedDate);
  const diffInfo = getQuestionDifficulty(item);
  
  const handlePing = () => {
    // Set custom ping date to today easily, but we can also use custom date logic outside.
    // For simplicity, ping just means "I solved it today"
    onPing(item.id, new Date().toISOString());
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      onDelete(item.id);
    }
  };

  return (
    <div className={`glass-panel question-card card-${categoryId}`}>
      <div className="card-header flex-between">
        <h3 className="card-title" title={item.name}>{item.name}</h3>
        {diffInfo && (
          <span className={`difficulty-badge diff-${diffInfo.level}`}>
            {diffInfo.label}
          </span>
        )}
      </div>
      <div className="card-meta">
        <div>Solved: {format(solvedDate, 'MMM d, yyyy')}</div>
        <div>{diffDays === 0 ? 'Today' : `${diffDays} day${diffDays === 1 ? '' : 's'} ago`}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button className="ping-btn" onClick={handlePing} style={{ flex: 1 }}>
          <RefreshCw size={16} />
          Ping (Revise)
        </button>
        <button className="ping-btn" onClick={handleDelete} style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.2)', padding: '8px' }} title="Delete question">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
