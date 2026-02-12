import { useState, useEffect, useRef, useCallback } from 'react';
import { WishTheme } from '@/components/ThemeSelector';

import birthdayMusic from '@/assets/music/Birthday.mp3';
import celebrationMusic from '@/assets/music/Celebration.mp3';
import weddingMusic from '@/assets/music/marriage.mp3';
import partyMusic from '@/assets/music/party.mp3';

const THEME_MUSIC: Record<string, string> = {
  birthday: birthdayMusic,
  love: partyMusic,
  valentine: weddingMusic,
  wedding: weddingMusic,
  celebration: celebrationMusic,
  congratulations: celebrationMusic,
  appreciation: weddingMusic,
  festival: partyMusic,
  event: celebrationMusic,
  default: birthdayMusic,
};

export function useThemeMusic(theme: WishTheme, isActive: boolean) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const playMusic = useCallback(() => {
    const src = THEME_MUSIC[theme] || THEME_MUSIC.default;

    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    } else if (audioRef.current.src !== new URL(src, window.location.href).href) {
      audioRef.current.pause();
      audioRef.current.src = src;
      audioRef.current.load();
    }

    audioRef.current.volume = volume;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [theme, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isActive && !isMuted) {
      playMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [isActive, isMuted, playMusic, stopMusic]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const changeVolume = useCallback((v: number) => {
    setVolume(Math.max(0, Math.min(1, v)));
  }, []);

  return { isMuted, isPlaying, volume, toggleMute, changeVolume };
}
