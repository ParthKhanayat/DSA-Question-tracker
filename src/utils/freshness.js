import { differenceInDays } from 'date-fns';

// 🟢 Fresh: 0-7 days
// 🟡 Slipping: 8-21 days
// 🟠 Stale: 22-60 days
// 🔴 Ancient: >60 days

export const getFreshnessCategory = (lastSolvedDateStr) => {
  if (!lastSolvedDateStr) return 'ancient';
  
  const lastSolved = new Date(lastSolvedDateStr);
  const now = new Date();
  
  // Ignore time component for pure day difference
  const diffDays = differenceInDays(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    new Date(lastSolved.getFullYear(), lastSolved.getMonth(), lastSolved.getDate())
  );
  
  if (diffDays <= 7) return 'fresh';
  if (diffDays <= 21) return 'slipping';
  if (diffDays <= 60) return 'stale';
  return 'ancient';
};

export const CategoryDetails = {
  fresh: { id: 'fresh', label: 'Fresh', color: 'var(--fresh-color)' },
  slipping: { id: 'slipping', label: 'Slipping', color: 'var(--slipping-color)' },
  stale: { id: 'stale', label: 'Stale', color: 'var(--stale-color)' },
  ancient: { id: 'ancient', label: 'Ancient', color: 'var(--ancient-color)' },
};
