import { useCallback, useRef, useEffect, useState } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

// Pre-generated audio using Web Audio API oscillators for magical sounds
const createMagicalSound = (type: 'open' | 'burst' | 'sparkle' | 'celebrate') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    const now = audioContext.currentTime;
    
    switch (type) {
      case 'open': {
        // Gift box opening - ascending magical chime
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;
      }
      case 'burst': {
        // Particle burst - quick sparkle
        for (let i = 0; i < 3; i++) {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600 + i * 200, now + i * 0.05);
          gain.gain.setValueAtTime(0.15, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2 + i * 0.05);
          osc.start(now + i * 0.05);
          osc.stop(now + 0.3);
        }
        break;
      }
      case 'sparkle': {
        // Soft sparkle - high frequency twinkle
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'celebrate': {
        // Celebration fanfare - chord progression
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.2, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          osc.start(now + i * 0.1);
          osc.stop(now + 1);
        });
        break;
      }
    }
  };
};

export const useSound = () => {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sound-muted') === 'true';
    }
    return false;
  });
  
  const soundsRef = useRef<Record<string, () => void>>({});
  
  useEffect(() => {
    // Initialize sounds lazily on first user interaction
    const initSounds = () => {
      if (Object.keys(soundsRef.current).length === 0) {
        soundsRef.current = {
          open: createMagicalSound('open'),
          burst: createMagicalSound('burst'),
          sparkle: createMagicalSound('sparkle'),
          celebrate: createMagicalSound('celebrate'),
        };
      }
    };
    
    document.addEventListener('click', initSounds, { once: true });
    document.addEventListener('touchstart', initSounds, { once: true });
    
    return () => {
      document.removeEventListener('click', initSounds);
      document.removeEventListener('touchstart', initSounds);
    };
  }, []);
  
  const play = useCallback((soundName: 'open' | 'burst' | 'sparkle' | 'celebrate') => {
    if (isMuted) return;
    
    try {
      const sound = soundsRef.current[soundName];
      if (sound) {
        sound();
      }
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }, [isMuted]);
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('sound-muted', String(newValue));
      return newValue;
    });
  }, []);
  
  return { play, isMuted, toggleMute };
};
