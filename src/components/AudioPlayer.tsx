import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/bg-sound.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    let userPaused = false;

    const tryPlay = async () => {
      if (userPaused) return;
      try {
        await audio.play();
        setIsPlaying(true);
        removeInteractionListeners(); // Success! Remove listeners
      } catch (err) {
        // Autoplay blocked by browser policy without interaction
        console.log("Autoplay blocked. Waiting for user interaction...");
      }
    };

    const removeInteractionListeners = () => {
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('scroll', tryPlay);
      document.removeEventListener('keydown', tryPlay);
    };

    // Attempt to play immediately
    tryPlay();

    // If blocked, wait for any user interaction to start playing
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('scroll', tryPlay, { once: true });
    document.addEventListener('keydown', tryPlay, { once: true });

    return () => {
      userPaused = true;
      removeInteractionListeners();
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent document click listener from immediately overriding this
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Error:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <button
      onClick={toggleAudio}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 50,
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '9999px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      title={isPlaying ? "Mute background sound" : "Play background sound"}
    >
      {isPlaying ? (
        <Volume2 size={24} style={{ opacity: 0.9 }} />
      ) : (
        <VolumeX size={24} style={{ opacity: 0.9 }} />
      )}
    </button>
  );
}
