import { useCallback, useRef } from 'react';
import { usePriceStore } from './usePriceStore';

export function useNotify() {
  const addToast = usePriceStore(s => s.addToast);
  const settings = usePriceStore(s => s.settings);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const notify = useCallback((title: string, body: string, type: 'info' | 'warning' | 'success' = 'info') => {
    // Always add in-app toast
    addToast({ title, body, type });

    // Browser notification if enabled
    if (settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      } else if (Notification.permission === 'default') {
        requestPermission().then(() => {
          if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
          }
        });
      }
    }
  }, [addToast, settings.notificationsEnabled, requestPermission]);

  const playAlertSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/alert.mp3');
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Fallback: use Web Audio API to generate a beep
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
      });
    } catch (e) {
      // Audio not available
    }
  }, [settings.soundEnabled]);

  return { notify, playAlertSound, requestPermission };
}
