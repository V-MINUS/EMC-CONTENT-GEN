'use client';

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const targetFPS = 30; // Target 30 FPS for better performance
  const frameDelay = 1000 / targetFPS;
  
  // Configuration options for the particles background
  const particleOptions = {
    count: 45, // Fewer particles for a subtle effect
    color: '#9b4dff', // Secondary color from EMC brand
    minSize: 1,
    maxSize: 2,
    speed: 0.12, // Slower movement for a gentle background
    connectParticles: true,
    lineColor: 'rgba(110, 18, 232, 0.05)', // Very subtle connections using primary color
    lineWidth: 0.5,
    minDistance: 180, // Increased distance for connecting particles
    maxConnections: 2 // Fewer connections per particle
  };

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };

    // Throttled mouse move handler
    let isThrottled = false;
    const throttledMouseMove = (e: MouseEvent) => {
      if (!isThrottled) {
        mousePosition.current = { x: e.clientX, y: e.clientY };
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, 50); // Throttle to once every 50ms
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', throttledMouseMove);
    
    handleResize();
    initializeParticles();
    startAnimation();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', throttledMouseMove);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const initializeParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;
    const particleCount = Math.min(particleOptions.count, Math.floor((width * height) / 12000)); // Using configured count
    
    particles.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (particleOptions.maxSize - particleOptions.minSize) + particleOptions.minSize,
        speedX: (Math.random() - 0.5) * particleOptions.speed, // Using configured speed
        speedY: (Math.random() - 0.5) * particleOptions.speed,
        color: particleOptions.color// Purple with varying opacity
      });
    }
  };

  const drawParticles = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Only update if enough time has passed since the last update
    if (timestamp - lastUpdateTime.current < frameDelay) {
      animationFrameId.current = requestAnimationFrame(drawParticles);
      return;
    }
    
    lastUpdateTime.current = timestamp;
    
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw particles
    particles.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > height) particle.speedY *= -1;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      
      // Connect particles within range
      if (particleOptions.connectParticles) {
        connectParticles(ctx, particle, index);
      }
    });
    
    animationFrameId.current = requestAnimationFrame(drawParticles);
  };

  const connectParticles = (
    ctx: CanvasRenderingContext2D,
    particle: Particle,
    index: number
  ) => {
    if (!particleOptions.connectParticles) return;
    
    const maxDistance = particleOptions.minDistance;
    const mouseInfluenceRadius = 200;
    const mouseConnectionAlpha = 0.3;
    
    let connections = 0;
    for (let i = index + 1; i < particles.current.length; i++) {
      const otherParticle = particles.current[i];
      const dx = particle.x - otherParticle.x;
      const dy = particle.y - otherParticle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < maxDistance && connections < particleOptions.maxConnections) {
        connections++;
        ctx.beginPath();
        ctx.strokeStyle = particleOptions.lineColor;
        ctx.lineWidth = particleOptions.lineWidth;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(otherParticle.x, otherParticle.y);
        ctx.stroke();
      }
    }
    
    // Connect to mouse position
    const dx = particle.x - mousePosition.current.x;
    const dy = particle.y - mousePosition.current.y;
    const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
    
    if (distanceToMouse < mouseInfluenceRadius) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(254, 45, 85, ${(1 - distanceToMouse / mouseInfluenceRadius) * mouseConnectionAlpha})`;
      ctx.lineWidth = 0.8;
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(mousePosition.current.x, mousePosition.current.y);
      ctx.stroke();
    }
  };

  const startAnimation = () => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(drawParticles);
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ParticlesBackground;
