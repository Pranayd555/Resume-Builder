import React, { useEffect, useRef } from 'react';

function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let gradient;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Recreate gradient when canvas is resized
      gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)'); // Blue
      gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.05)'); // Purple
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)'); // Pink
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // Slightly smaller particles
        this.speedX = (Math.random() - 0.5) * 1.5; // Smoother movement
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`; // Blue to purple range
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges with smooth reflection
        if (this.x > canvas.width || this.x < 0) {
          this.speedX *= -0.9; // Slightly dampen bounce
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY *= -0.9;
        }

        // Keep particles within bounds
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles with reduced count for better performance
    const particles = [];
    const particleCount = Math.min(30, Math.floor(canvas.width * canvas.height / 30000));

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop with optimizations
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Use pre-created gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Optimized connecting lines - only check every other frame for better performance
      if (Date.now() % 2 === 0) {
        const maxDistance = 80; // Reduced distance for better performance
        const maxDistanceSquared = maxDistance * maxDistance;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < maxDistanceSquared) {
              const distance = Math.sqrt(distanceSquared);
              ctx.globalAlpha = (maxDistance - distance) / maxDistance * 0.2;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // Simplified wave effect - only draw every 3rd frame
      if (Date.now() % 3 === 0) {
        const time = Date.now() * 0.0005; // Slower wave movement
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x += 30) { // Fewer points
          const y = canvas.height / 2 + Math.sin(x * 0.01 + time) * 40;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    />
  );
}

export default AnimatedBackground; 