import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { getFreshnessCategory } from '../utils/freshness';

export const QuestionCard = ({ item, onPing }) => {
  const categoryId = getFreshnessCategory(item.lastSolvedDate);
  const solvedDate = new Date(item.lastSolvedDate);
  const diffDays = differenceInDays(new Date(), solvedDate);
  
  const handlePing = () => {
    // Set custom ping date to today easily, but we can also use custom date logic outside.
    // For simplicity, ping just means "I solved it today"
    onPing(item.id, new Date().toISOString());
  };

  return (
    <div className={`glass-panel question-card card-${categoryId}`}>
      <div className="flex-between">
        <h3 className="card-title" title={item.name}>{item.name}</h3>
      </div>
      <div className="card-meta">
        <div>Solved: {format(solvedDate, 'MMM d, yyyy')}</div>
        <div>{diffDays === 0 ? 'Today' : `${diffDays} day${diffDays === 1 ? '' : 's'} ago`}</div>
      </div>
      <button className="ping-btn" onClick={handlePing}>
        <RefreshCw size={16} />
        Ping (Revise)
      </button>
    </div>
  );
};
