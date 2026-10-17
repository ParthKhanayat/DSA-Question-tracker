import React, { useMemo } from 'react';
import { getQuestionDifficulty } from '../utils/difficulty';
import { SparkleRing } from './SparkleRing';
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
        {/* Fiery Sparkle Ring */}
        <div className="lc-donut-container">
          <SparkleRing easy={easy} med={med} hard={hard} totalSolved={totalSolved} />

          {/* Center text in fiery sparkle ring */}
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
