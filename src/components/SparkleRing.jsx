import React, { useEffect, useRef } from 'react';

const COLOR_PALETTES = {
  easy: {
    glow: 'rgba(34, 197, 94, 0.6)',
    flame: '#22c55e',
    bright: '#86efac',
    core: '#f0fdf4',
    sparks: ['#4ade80', '#86efac', '#bbf7d0', '#ffffff', '#22c55e']
  },
  med: {
    // Fiery amber/gold/orange like the reference image
    glow: 'rgba(234, 88, 12, 0.7)',
    flame: '#f59e0b',
    bright: '#fde047',
    core: '#fffbeb',
    sparks: ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff', '#ea580c']
  },
  hard: {
    glow: 'rgba(239, 68, 68, 0.7)',
    flame: '#ef4444',
    bright: '#fca5a5',
    core: '#fff1f2',
    sparks: ['#ef4444', '#f87171', '#fecaca', '#ffffff', '#dc2626']
  },
  empty: {
    glow: 'rgba(217, 119, 6, 0.25)',
    flame: '#78350f',
    bright: '#b45309',
    core: '#d97706',
    sparks: ['#92400e', '#d97706', '#f59e0b']
  }
};

export const SparkleRing = ({ easy = 0, med = 0, hard = 0, totalSolved = 0 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const sparksRef = useRef([]);

  // Initialize sparks pool
  useEffect(() => {
    const sparks = [];
    for (let i = 0; i < 35; i++) {
      sparks.push({
        angle: Math.random() * Math.PI * 2,
        distOffset: (Math.random() - 0.3) * 8,
        radialSpeed: (Math.random() * 0.15 + 0.05),
        rotSpeed: (Math.random() - 0.5) * 0.03,
        size: Math.random() * 1.6 + 0.8,
        alpha: Math.random(),
        decay: Math.random() * 0.02 + 0.015,
        colorIndex: Math.floor(Math.random() * 5)
      });
    }
    sparksRef.current = sparks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 114;
    const height = 114;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = 40;

    let isSubscribed = true;

    const render = () => {
      if (!isSubscribed) return;

      timeRef.current += 0.045;
      const t = timeRef.current;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Determine active arc segments
      const total = easy + med + hard;
      const segments = [];

      if (total > 0) {
        let activeCount = 0;
        if (easy > 0) activeCount++;
        if (med > 0) activeCount++;
        if (hard > 0) activeCount++;

        const gap = activeCount > 1 ? 0.08 : 0;
        const availableSweep = Math.PI * 2 - (gap * activeCount);

        let currentAngle = -Math.PI / 2;

        if (easy > 0) {
          const sweep = (easy / total) * availableSweep;
          segments.push({
            type: 'easy',
            palette: COLOR_PALETTES.easy,
            start: currentAngle,
            end: currentAngle + sweep
          });
          currentAngle += sweep + gap;
        }

        if (med > 0) {
          const sweep = (med / total) * availableSweep;
          segments.push({
            type: 'med',
            palette: COLOR_PALETTES.med,
            start: currentAngle,
            end: currentAngle + sweep
          });
          currentAngle += sweep + gap;
        }

        if (hard > 0) {
          const sweep = (hard / total) * availableSweep;
          segments.push({
            type: 'hard',
            palette: COLOR_PALETTES.hard,
            start: currentAngle,
            end: currentAngle + sweep
          });
          currentAngle += sweep + gap;
        }
      } else {
        // Subtle smoldering empty ring when 0 questions solved
        segments.push({
          type: 'empty',
          palette: COLOR_PALETTES.empty,
          start: -Math.PI / 2,
          end: Math.PI * 1.5
        });
      }

      // Draw each fiery arc segment
      segments.forEach(seg => {
        const pal = seg.palette;
        const startAngle = seg.start;
        const endAngle = seg.end;
        const sweep = endAngle - startAngle;
        const steps = Math.max(16, Math.floor(sweep * 32));

        // Generate undulating flame points along the arc
        const points = [];
        for (let i = 0; i <= steps; i++) {
          const fraction = i / steps;
          const theta = startAngle + fraction * sweep;

          // Organic turbulent flame fluctuation (sine combinations)
          const n1 = Math.sin(theta * 8 + t * 4.2);
          const n2 = Math.cos(theta * 16 - t * 5.5);
          const n3 = Math.sin(theta * 28 + t * 8.1);
          const flameOffset = (n1 * 1.6 + n2 * 1.1 + n3 * 0.7);
          const r = baseRadius + flameOffset;

          points.push({
            x: cx + r * Math.cos(theta),
            y: cy + r * Math.sin(theta),
            r,
            theta
          });
        }

        if (points.length < 2) return;

        // Path helper
        const tracePath = () => {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
        };

        // 1. Outer diffuse fiery aura
        ctx.save();
        tracePath();
        ctx.lineCap = 'round';
        ctx.lineWidth = 5.2;
        ctx.shadowBlur = 14;
        ctx.shadowColor = pal.glow;
        ctx.strokeStyle = pal.flame;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.restore();

        // 2. Middle vibrant burning flame
        ctx.save();
        tracePath();
        ctx.lineCap = 'round';
        ctx.lineWidth = 2.6;
        ctx.shadowBlur = 7;
        ctx.shadowColor = pal.bright;
        ctx.strokeStyle = pal.flame;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
        ctx.restore();

        // 3. White-hot electric molten core line (matches the intense bright core in reference image)
        ctx.save();
        tracePath();
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.3;
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        ctx.restore();
      });

      // Update & render sparkle flecks and orbiting embers
      const sparks = sparksRef.current;
      sparks.forEach(sp => {
        sp.alpha -= sp.decay;
        sp.distOffset += sp.radialSpeed;
        sp.angle += sp.rotSpeed;

        // Pick matching segment palette for this spark's angle
        let activePalette = COLOR_PALETTES.empty;
        for (let s = 0; s < segments.length; s++) {
          let a = sp.angle % (Math.PI * 2);
          if (a < -Math.PI / 2) a += Math.PI * 2;
          if (a >= segments[s].start && a <= segments[s].end) {
            activePalette = segments[s].palette;
            break;
          }
        }

        // Respawn spark if dead
        if (sp.alpha <= 0 || sp.distOffset > 9 || sp.distOffset < -4) {
          sp.alpha = Math.random() * 0.9 + 0.1;
          sp.distOffset = (Math.random() - 0.4) * 5;
          sp.angle = Math.random() * Math.PI * 2;
          sp.decay = Math.random() * 0.025 + 0.015;
          sp.size = Math.random() * 1.5 + 0.7;
          sp.colorIndex = Math.floor(Math.random() * activePalette.sparks.length);
        }

        const currentR = baseRadius + sp.distOffset;
        const sx = cx + currentR * Math.cos(sp.angle);
        const sy = cy + currentR * Math.sin(sp.angle);
        const color = activePalette.sparks[sp.colorIndex % activePalette.sparks.length] || '#ffffff';

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, sp.alpha));
        ctx.beginPath();
        ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      isSubscribed = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [easy, med, hard, totalSolved]);

  return (
    <canvas
      ref={canvasRef}
      className="lc-sparkle-canvas"
      aria-hidden="true"
    />
  );
};
