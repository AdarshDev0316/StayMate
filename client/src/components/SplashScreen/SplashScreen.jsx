import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [isClosing, setIsClosing] = useState(false);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Play premium startup sound
    const playSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        audioContextRef.current = new AudioContext();
        const ctx = audioContextRef.current;
        
        // Only play if not in reduced motion and context is allowed
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1); // Volume 5% to be very soft
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6); 

        // Premium chord (Cmaj9)
        const frequencies = [523.25, 659.25, 783.99, 987.77];
        frequencies.forEach(freq => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.connect(gainNode);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        });
      } catch (err) {
        console.warn('Audio autoplay blocked or not supported');
      }
    };

    // Attempt to play sound on mount
    playSound();

    // Sequence timing
    const sequenceDuration = 2400; // 2.4 seconds total sequence
    const fadeOutDuration = 500; // 0.5 seconds fade out

    const closeTimer = setTimeout(() => {
      setIsClosing(true);
    }, sequenceDuration);

    const completeTimer = setTimeout(() => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      onComplete();
    }, sequenceDuration + fadeOutDuration);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(completeTimer);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [onComplete]);

  return (
    <div className={`splash-container ${isClosing ? 'splash-closing' : ''}`}>
      <div className="splash-background"></div>
      
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          {/* Expanding glow */}
          <div className="splash-glow"></div>
          
          {/* Particles */}
          <div className="splash-particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`splash-particle particle-${i + 1}`}></div>
            ))}
          </div>
          
          <img src="/logo.jpg" alt="StayMate Logo" className="splash-logo" />
        </div>
        
        <div className="splash-text-wrapper">
          <h2 className="splash-tagline">Find Your Perfect Room & Flatmate</h2>
          
          {/* Elegant 3 dots loading */}
          <div className="splash-loading">
            <div className="splash-dot"></div>
            <div className="splash-dot"></div>
            <div className="splash-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
