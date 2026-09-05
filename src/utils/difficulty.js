import questionsData from '../data/questions.json';

let idMap = null;
let titleMap = null;

function initMaps() {
  if (idMap) return;
  idMap = new Map();
  titleMap = new Map();

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    idMap.set(q.id, q);
    idMap.set(String(q.id), q);
    if (q.title) {
      titleMap.set(q.title.toLowerCase().trim(), q);
    }
  }
}

export function getDifficultyDetails(diff) {
  if (diff === null || diff === undefined) return null;

  if (diff === 1 || diff === '1' || String(diff).toLowerCase() === 'easy') {
    return { level: 1, label: 'Easy' };
  }
  if (diff === 2 || diff === '2' || String(diff).toLowerCase() === 'medium' || String(diff).toLowerCase() === 'med') {
    return { level: 2, label: 'Medium' };
  }
  if (diff === 3 || diff === '3' || String(diff).toLowerCase() === 'hard') {
    return { level: 3, label: 'Hard' };
  }
  return null;
}

export function getQuestionDifficulty(item) {
  if (!item) return null;

  // 1. Direct difficulty on item if already present
  if (item.difficulty !== undefined && item.difficulty !== null) {
    const details = getDifficultyDetails(item.difficulty);
    if (details) return details;
  }

  initMaps();

  // 2. Check id if it's "lc-{id}" or numeric
  if (item.id) {
    const lcMatch = String(item.id).match(/^lc-(\d+)$/i);
    if (lcMatch) {
      const match = idMap.get(Number(lcMatch[1]));
      if (match) return getDifficultyDetails(match.difficulty);
    }
    if (idMap.has(item.id)) {
      const match = idMap.get(item.id);
      if (match) return getDifficultyDetails(match.difficulty);
    }
  }

  // 3. Check name (e.g., "1. Two Sum" or "Two Sum")
  if (item.name) {
    const trimmedName = String(item.name).trim();

    // Check if name has number prefix like "1. Two Sum" or "1 - Two Sum"
    const prefixMatch = trimmedName.match(/^(\d+)[.\s-]+(.+)$/);
    if (prefixMatch) {
      const numId = Number(prefixMatch[1]);
      const matchById = idMap.get(numId);
      if (matchById) return getDifficultyDetails(matchById.difficulty);

      const titlePart = prefixMatch[2].toLowerCase().trim();
      const matchByTitle = titleMap.get(titlePart);
      if (matchByTitle) return getDifficultyDetails(matchByTitle.difficulty);
    }

    // Direct title lookup
    const directTitleMatch = titleMap.get(trimmedName.toLowerCase());
    if (directTitleMatch) return getDifficultyDetails(directTitleMatch.difficulty);
  }

  return null;
}
