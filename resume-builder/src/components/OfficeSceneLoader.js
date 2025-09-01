import React, { useEffect, useRef, useState } from 'react';

const OfficeSceneLoader = ({ title = "Generating Your Resume Preview", subtitle = "Our team is carefully crafting your professional resume with attention to every detail" }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.offsetWidth;
        const viewportWidth = window.innerWidth;
        
        // Responsive sizing based on container width and viewport
        let width, height;
        
        // Calculate maximum available space - more conservative
        const maxWidth = Math.min(containerWidth - 48, viewportWidth * 0.6);
        
        if (containerWidth < 400) {
          // Mobile - increased height for better viewing
          width = Math.min(maxWidth, 250);
          height = width; // Perfect square
        } else if (containerWidth < 600) {
          // Tablet
          width = Math.min(maxWidth, 320);
          height = width; // Perfect square
        } else if (containerWidth < 900) {
          // Small desktop
          width = Math.min(maxWidth, 400);
          height = width; // Perfect square
        } else {
          // Large desktop
          width = Math.min(maxWidth, 480);
          height = width; // Perfect square
        }
        
        // Ensure minimum size and maintain square aspect ratio
        const minSize = Math.max(width, height, 180); // Use the larger of width/height for minimum
        width = minSize;
        height = minSize; // Always keep it square
        
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize.width) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let balls = [];

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // 3D Ball class
    class Ball {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.z = Math.random() * 100; // Depth for 3D effect
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 2 + 1;
        this.vz = (Math.random() - 0.5) * 0.5;
        this.radius = 6 + Math.random() * 4;
        this.color = this.getRandomColor();
        this.gravity = 0.1; // Reduced from 0.15 for slower falling
        this.bounce = 0.6;
        this.bounceCount = 0;
        this.maxBounces = 2;
        this.invisiblePlaneY = canvas.height * 0.7; // Invisible plane at 70% of canvas height
        this.holeY = canvas.height + 20; // Invisible hole below canvas
      }

      getRandomColor() {
        const colors = [
          '#3b82f6', // Blue
          '#9333ea', // Purple
          '#ec4899', // Pink
          '#14b8a6', // Teal
          '#f59e0b', // Orange
          '#ef4444', // Red
          '#10b981', // Emerald
          '#8b5cf6', // Violet
          '#f97316', // Orange
          '#06b6d4', // Cyan
          '#84cc16', // Lime
          '#f43f5e', // Rose
          '#6366f1', // Indigo
          '#22c55e', // Green
          '#eab308'  // Yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Apply gravity
        this.vy += this.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Keep z within bounds
        if (this.z < 0) this.z = 0;
        if (this.z > 100) this.z = 100;

        // Calculate 3D scale based on depth
        this.scale = 1 - (this.z / 100) * 0.5;

        // Bounce off walls
        if (this.x - this.radius * this.scale < 0 || this.x + this.radius * this.scale > canvas.width) {
          this.vx *= -0.8;
        }

        // Bounce on invisible plane (up to maxBounces times)
        if (this.y >= this.invisiblePlaneY && this.bounceCount < this.maxBounces) {
          this.y = this.invisiblePlaneY;
          this.vy *= -this.bounce;
          this.bounceCount++;
        }

        // Fall into invisible hole and reset
        if (this.y >= this.holeY) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        
        // Apply 3D transformation
        const x = this.x + (this.z - 50) * 0.1; // Parallax effect
        const y = this.y;
        const radius = this.radius * this.scale;
        
        // Calculate distance to plane for shadow intensity
        const distanceToPlane = Math.abs(this.y - this.invisiblePlaneY);
        const maxShadowDistance = 100; // Distance at which shadow starts appearing
        const shadowIntensity = Math.max(0, 1 - distanceToPlane / maxShadowDistance);
        
        // Draw shadow on the plane when ball is close or on it
        if (shadowIntensity > 0.05) { // Only show shadow when close enough
          // Shadow size: 70% of ball size when touching, smaller when further
          const maxShadowSize = radius * 0.7; // 70% of ball size
          const shadowSize = maxShadowSize * shadowIntensity;
          
          const shadowY = this.invisiblePlaneY + 2; // Slightly below the plane
          
          // Create shadow gradient
          const shadowGradient = ctx.createRadialGradient(x, shadowY, 0, x, shadowY, shadowSize);
          shadowGradient.addColorStop(0, `rgba(0, 0, 0, ${0.4 * shadowIntensity})`);
          shadowGradient.addColorStop(0.5, `rgba(0, 0, 0, ${0.2 * shadowIntensity})`);
          shadowGradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
          
          ctx.fillStyle = shadowGradient;
          ctx.beginPath();
          ctx.arc(x, shadowY, shadowSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Create gradient for 3D effect
        const gradient = ctx.createRadialGradient(x, y - radius * 0.3, 0, x, y, radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, this.getDarkerColor(this.color));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      getDarkerColor(color) {
        // Simple color darkening
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    // Initialize balls with staggered starting positions
    const createBall = (staggered = false) => {
      if (balls.length < 50) { // Increased max balls for continuous flow
        const ball = new Ball();
        if (staggered) {
          // Stagger some balls to different starting positions for continuous flow
          ball.y = Math.random() * canvas.height * 0.5 - 50; // Random position in upper half
        }
        balls.push(ball);
      }
    };

    // Create initial balls with staggered positions
    for (let i = 0; i < 25; i++) { // Increased initial ball count
      createBall(true); // Staggered positions
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw balls
      balls.forEach(ball => {
        ball.update();
        ball.draw();
      });

      // Create new balls more frequently for continuous flow
      if (Math.random() < 0.08) { // Reduced from 0.15 for slower spawn rate
        createBall();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [canvasSize]);

  return (
    <div className="w-full flex items-center justify-center py-4 sm:py-6 lg:py-8 px-4">
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes titleFadeIn {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          50% { 
            opacity: 0.5; 
            transform: translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes titlePulse {
          0% { 
            opacity: 0.3; 
            transform: scale(0.95); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.02); 
          }
          100% { 
            opacity: 0.3; 
            transform: scale(0.95); 
          }
        }
        
        @keyframes processingDots {
          0%, 20% { opacity: 0; }
          40% { opacity: 1; }
          60%, 100% { opacity: 0; }
        }
        
        @keyframes flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .canvas-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          overflow: hidden;
        }
        
        .loading-text {
          animation: fadeIn 0.5s ease-out;
        }
        
        .loading-dots {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .processing-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
        }
        
        .processing-dot {
          width: 4px;
          height: 4px;
          background: #3b82f6;
          border-radius: 50%;
          animation: processingDots 1.5s ease-in-out infinite;
        }
        
        .processing-dot:nth-child(1) { animation-delay: 0s; }
        .processing-dot:nth-child(2) { animation-delay: 0.2s; }
        .processing-dot:nth-child(3) { animation-delay: 0.4s; }
        .processing-dot:nth-child(4) { animation-delay: 0.6s; }
        .processing-dot:nth-child(5) { animation-delay: 0.8s; }
      `}</style>
      
      {/* Main Container */}
      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl mx-auto">
        {/* Card Content */}
        <div className="relative rounded-2xl p-4 sm:p-6 lg:p-8">
          {/* 3D Rain Animation Container */}
          <div className="canvas-container mb-4 sm:mb-6" ref={containerRef}>
            <canvas 
              ref={canvasRef}
              className="w-full h-full rounded-lg"
              style={{
                height: `${canvasSize.height}px`
              }}
            />
          </div>

          {/* Loading Text */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="loading-text">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2" style={{ animation: 'titlePulse 3s ease-in-out infinite' }}>
                {title}
              </h2>
              
              {/* Simple Loading Dots */}
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full loading-dots" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full loading-dots" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full loading-dots" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
              {subtitle}
            </p>
          </div>

          {/* Simple Progress Bar */}
          <div className="mt-4 sm:mt-6">
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 animate-pulse"
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #9333ea, #ec4899, #3b82f6)',
                  backgroundSize: '200% 100%',
                  animation: 'flow 2s ease-in-out infinite'
                }}
              ></div>
            </div>
            <div className="flex justify-center items-center mt-2">
              <span className="text-xs text-gray-500 mr-2">Processing</span>
              <div className="processing-dots">
                <div className="processing-dot"></div>
                <div className="processing-dot"></div>
                <div className="processing-dot"></div>
                <div className="processing-dot"></div>
                <div className="processing-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeSceneLoader;
