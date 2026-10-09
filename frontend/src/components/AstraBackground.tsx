'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
}

export const AstraBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Warm Astra Gold & Amethyst Violet Palette (Strictly ZERO blue, ZERO green)
    const particleColors = [
      '245, 158, 11',   // Amber Gold
      '251, 191, 36',   // Bright Solar Gold
      '217, 119, 6',    // Warm Bronze
      '168, 85, 247',   // Amethyst Violet
      '192, 132, 252',  // Soft Lilac / Purple
      '255, 255, 255',  // Pure Starlight White
    ];

    const particleCount = Math.min(Math.floor((width * height) / 12000), 120);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.6,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Deep void black base
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Ambient warm cosmic aura nebulae in background
      const grad1 = ctx.createRadialGradient(
        width * 0.2 + Math.sin(time * 0.5) * 60,
        height * 0.3 + Math.cos(time * 0.4) * 40,
        20,
        width * 0.2,
        height * 0.3,
        width * 0.45
      );
      grad1.addColorStop(0, 'rgba(245, 158, 11, 0.045)'); // Warm Amber
      grad1.addColorStop(0.6, 'rgba(217, 119, 6, 0.015)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.8 + Math.cos(time * 0.6) * 50,
        height * 0.7 + Math.sin(time * 0.5) * 50,
        20,
        width * 0.8,
        height * 0.7,
        width * 0.4
      );
      grad2.addColorStop(0, 'rgba(168, 85, 247, 0.04)'); // Amethyst Violet
      grad2.addColorStop(0.7, 'rgba(147, 51, 234, 0.01)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle pulsing opacity
        p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed * 60) * 0.15;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.05, p.alpha)})`;
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Constellation lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `rgba(245, 158, 11, ${lineAlpha})`; // Solar line
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
      style={{ background: '#000000' }}
    />
  );
};
