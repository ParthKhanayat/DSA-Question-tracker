import React, { useEffect, useRef } from 'react';

const FIREWORK_COLORS = [
  '#ff3b5c', '#ffb800', '#00e5ff', '#a855f7',
  '#22c55e', '#ec4899', '#f97316', '#3b82f6', '#ffffff'
];

const SMILEY_EMOJIS = ['😊', '😄', '🌟', '✨', '🎉', '😃', '⭐', '💛', '🔥'];

export const CelebrationOverlay = ({ trigger }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const rocketsRef = useRef([]);
  const badgesRef = useRef([]);
  const isRunningRef = useRef(false);

  // Resize canvas to match window
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Main animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      isRunningRef.current = false;
      return;
    }

    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    // 1. Update & Draw Rockets
    const rockets = rocketsRef.current;
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += r.gravity;

      // Draw rocket trail
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = r.color;
      ctx.fill();
      ctx.restore();

      // Spark trail
      if (Math.random() < 0.6) {
        particlesRef.current.push({
          type: 'spark',
          x: r.x + (Math.random() - 0.5) * 4,
          y: r.y + 4,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 2 + 1,
          color: '#ffdd88',
          alpha: 0.8,
          decay: 0.05,
          gravity: 0.05,
          friction: 0.96
        });
      }

      // Detonate at apex or target
      if (r.y <= r.targetY || r.vy >= -1) {
        // Explode
        const count = 75 + Math.floor(Math.random() * 30);
        const baseColor = r.color;
        for (let j = 0; j < count; j++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6.5 + 1.2;
          const color = Math.random() < 0.25 ? '#ffffff' : (Math.random() < 0.5 ? baseColor : FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]);
          particlesRef.current.push({
            type: 'firework',
            x: r.x,
            y: r.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color,
            size: Math.random() * 2.8 + 1.4,
            alpha: 1.0,
            decay: Math.random() * 0.016 + 0.014,
            gravity: 0.08,
            friction: 0.975,
            flicker: Math.random() > 0.4
          });
        }
        rockets.splice(i, 1);
      }
    }

    // 2. Update & Draw Particles (Fireworks & Smileys)
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.type === 'smiley') {
        // Draw rotating smiley emoji
        p.rotation += p.rotSpeed;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, 0, 0);
      } else {
        // Firework or spark circle
        ctx.beginPath();
        const displayAlpha = p.flicker && Math.random() < 0.3 ? p.alpha * 0.4 : p.alpha;
        ctx.globalAlpha = Math.max(0, Math.min(1, displayAlpha));
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. Update & Draw Badges (e.g. "+1 Revised!" cheerful pop)
    const badges = badgesRef.current;
    for (let i = badges.length - 1; i >= 0; i--) {
      const b = badges[i];
      b.progress += 0.025;
      b.y += b.vy;
      b.alpha = b.progress < 0.7 ? 1 : Math.max(0, 1 - (b.progress - 0.7) / 0.3);

      if (b.progress >= 1.0) {
        badges.splice(i, 1);
        continue;
      }

      // Spring scale effect
      let scale = 1;
      if (b.progress < 0.2) {
        scale = (b.progress / 0.2) * 1.15;
      } else if (b.progress < 0.35) {
        scale = 1.15 - ((b.progress - 0.2) / 0.15) * 0.15;
      }

      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.translate(b.x, b.y);
      ctx.scale(scale, scale);

      // Pill background
      const text = b.text;
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textMetrics = ctx.measureText(text);
      const pillWidth = textMetrics.width + 36;
      const pillHeight = 36;

      ctx.beginPath();
      ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, 18);
      ctx.fillStyle = '#121217';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#22c55e';
      ctx.stroke();

      // Text inside pill
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);

      ctx.restore();
    }

    // If particles remain, keep loop going; otherwise stop and clear
    if (rockets.length > 0 || particles.length > 0 || badges.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, width, height);
      isRunningRef.current = false;
    }
  };

  const startLoopIfNeeded = () => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // Launch fireworks sequence
  const launchFireworks = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Launch 3 to 4 staggered rockets
    const count = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const startX = width * (0.2 + (i / count) * 0.6 + (Math.random() - 0.5) * 0.1);
        const targetY = height * (0.15 + Math.random() * 0.25);
        rocketsRef.current.push({
          x: startX,
          y: height,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -13 - Math.random() * 3.5,
          targetY,
          color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
          gravity: 0.05
        });
        startLoopIfNeeded();
      }, i * 160);
    }
  };

  // Launch smiley celebration sequence
  const launchSmileys = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Pop celebratory banner in center
    badgesRef.current.push({
      x: width / 2,
      y: height * 0.42,
      vy: -0.6,
      text: '😊 Revised! Freshness updated',
      progress: 0,
      alpha: 1.0
    });

    // 2. Burst of smiley emojis and golden stars
    const particleCount = 30 + Math.floor(Math.random() * 10);
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 0.15) + (Math.random() * Math.PI * 0.7); // upward fan: 30° to 150°
      const speed = Math.random() * 8 + 6;
      const char = SMILEY_EMOJIS[Math.floor(Math.random() * SMILEY_EMOJIS.length)];

      particlesRef.current.push({
        type: 'smiley',
        char,
        x: width * 0.5 + (Math.random() - 0.5) * (Math.min(width * 0.4, 400)),
        y: height * 0.6 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.sin(angle) * speed,
        gravity: 0.22,
        friction: 0.985,
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        size: Math.floor(Math.random() * 16 + 26), // 26px to 42px
        alpha: 1.0,
        decay: Math.random() * 0.012 + 0.012
      });
    }

    startLoopIfNeeded();
  };

  // Listen for trigger prop changes
  useEffect(() => {
    if (!trigger) return;

    if (trigger.type === 'fireworks') {
      launchFireworks();
    } else if (trigger.type === 'smiley') {
      launchSmileys();
    }
  }, [trigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="celebration-canvas"
      aria-hidden="true"
    />
  );
};
