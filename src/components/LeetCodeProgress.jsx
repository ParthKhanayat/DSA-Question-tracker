import React, { useMemo } from 'react';
import { getQuestionDifficulty } from '../utils/difficulty';
import { Code2 } from 'lucide-react';

const TOTAL_EASY = 800;
const TOTAL_MED = 1925;
const TOTAL_HARD = 899;
const TOTAL_CATALOG = 3624;

export const LeetCodeProgress = ({ questions = [] }) => {
  const stats = useMemo(() => {
    let easy = 0;
    let med = 0;
    let hard = 0;
    let custom = 0;

    questions.forEach(q => {
      const diff = getQuestionDifficulty(q);
      if (diff?.level === 1) easy++;
      else if (diff?.level === 2) med++;
      else if (diff?.level === 3) hard++;
      else custom++;
    });

    const totalSolved = questions.length;
    return {
      easy,
      med,
      hard,
      custom,
      totalSolved,
      totalCatalog: TOTAL_CATALOG,
      totalEasy: TOTAL_EASY,
      totalMed: TOTAL_MED,
      totalHard: TOTAL_HARD
    };
  }, [questions]);

  const { easy, med, hard, custom, totalSolved } = stats;

  // Donut chart calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const totalDifficultySolved = easy + med + hard;

  // Arc segments based on solved distribution
  let easyDash = 0;
  let medDash = 0;
  let hardDash = 0;
  let easyOffset = 0;
  let medOffset = 0;
  let hardOffset = 0;

  if (totalDifficultySolved > 0) {
    const gap = totalDifficultySolved > 1 ? 2.5 : 0;
    const effectiveC = circumference - (gap * ((easy > 0 ? 1 : 0) + (med > 0 ? 1 : 0) + (hard > 0 ? 1 : 0)));

    const easyLen = easy > 0 ? (easy / totalDifficultySolved) * effectiveC : 0;
    const medLen = med > 0 ? (med / totalDifficultySolved) * effectiveC : 0;
    const hardLen = hard > 0 ? (hard / totalDifficultySolved) * effectiveC : 0;

    easyDash = easyLen;
    medDash = medLen;
    hardDash = hardLen;

    easyOffset = 0;
    medOffset = -(easyLen + (easy > 0 ? gap : 0));
    hardOffset = -(easyLen + (easy > 0 ? gap : 0) + medLen + (med > 0 ? gap : 0));
  }

  const easyPct = ((easy / TOTAL_EASY) * 100).toFixed(1);
  const medPct = ((med / TOTAL_MED) * 100).toFixed(1);
  const hardPct = ((hard / TOTAL_HARD) * 100).toFixed(1);
  const totalPct = ((totalSolved / TOTAL_CATALOG) * 100).toFixed(1);

  return (
    <div className="glass-panel leetcode-progress-card">
      <div className="lc-progress-header">
        <div className="lc-progress-title-wrap">
          <Code2 size={16} className="lc-icon" />
          <span className="lc-progress-title">LeetCode Progress</span>
        </div>
        <div className="lc-badge-wrap">
          <span className="lc-overall-badge">{totalPct}% Completed</span>
          {custom > 0 && <span className="lc-custom-badge">+{custom} Custom</span>}
        </div>
      </div>

      <div className="lc-progress-body">
        {/* Left Circular Ring */}
        <div className="lc-donut-container">
          <svg className="lc-donut-svg" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="lc-donut-bg"
              strokeWidth="7"
              fill="none"
            />

            {/* Easy segment */}
            {easy > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="lc-donut-easy"
                strokeWidth="7"
                fill="none"
                strokeDasharray={`${easyDash} ${circumference - easyDash}`}
                strokeDashoffset={easyOffset}
                strokeLinecap="round"
              />
            )}

            {/* Medium segment */}
            {med > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="lc-donut-med"
                strokeWidth="7"
                fill="none"
                strokeDasharray={`${medDash} ${circumference - medDash}`}
                strokeDashoffset={medOffset}
                strokeLinecap="round"
              />
            )}

            {/* Hard segment */}
            {hard > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="lc-donut-hard"
                strokeWidth="7"
                fill="none"
                strokeDasharray={`${hardDash} ${circumference - hardDash}`}
                strokeDashoffset={hardOffset}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Center text in donut */}
          <div className="lc-donut-center">
            <span className="lc-center-count">{totalSolved}</span>
            <span className="lc-center-total">/{TOTAL_CATALOG}</span>
            <span className="lc-center-label">Solved</span>
          </div>
        </div>

        {/* Right Difficulty Breakdown Bars */}
        <div className="lc-breakdown">
          {/* Easy Row */}
          <div className="lc-diff-item">
            <div className="lc-diff-header">
              <span className="lc-diff-label lc-easy-text">Easy</span>
              <div className="lc-diff-numbers">
                <span className="lc-diff-solved">{easy}</span>
                <span className="lc-diff-total">/{TOTAL_EASY}</span>
                <span className="lc-diff-pct">({easyPct}%)</span>
              </div>
            </div>
            <div className="lc-bar-track lc-easy-track">
              <div 
                className="lc-bar-fill lc-easy-fill" 
                style={{ width: `${Math.min(100, (easy / TOTAL_EASY) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Medium Row */}
          <div className="lc-diff-item">
            <div className="lc-diff-header">
              <span className="lc-diff-label lc-med-text">Med.</span>
              <div className="lc-diff-numbers">
                <span className="lc-diff-solved">{med}</span>
                <span className="lc-diff-total">/{TOTAL_MED}</span>
                <span className="lc-diff-pct">({medPct}%)</span>
              </div>
            </div>
            <div className="lc-bar-track lc-med-track">
              <div 
                className="lc-bar-fill lc-med-fill" 
                style={{ width: `${Math.min(100, (med / TOTAL_MED) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Hard Row */}
          <div className="lc-diff-item">
            <div className="lc-diff-header">
              <span className="lc-diff-label lc-hard-text">Hard</span>
              <div className="lc-diff-numbers">
                <span className="lc-diff-solved">{hard}</span>
                <span className="lc-diff-total">/{TOTAL_HARD}</span>
                <span className="lc-diff-pct">({hardPct}%)</span>
              </div>
            </div>
            <div className="lc-bar-track lc-hard-track">
              <div 
                className="lc-bar-fill lc-hard-fill" 
                style={{ width: `${Math.min(100, (hard / TOTAL_HARD) * 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
