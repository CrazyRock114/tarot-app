import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Pause, Play, Square, Loader2 } from 'lucide-react';

interface VoiceReaderProps {
  text: string;
  readerStyle?: string;
  ready?: boolean;
}

const VoiceReader = ({ text, readerStyle = 'mystic', ready = true }: VoiceReaderProps) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWaitTip, setShowWaitTip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string>('');

  const handlePlay = async () => {
    if (!ready) {
      setShowWaitTip(true);
      setTimeout(() => setShowWaitTip(false), 2000);
      return;
    }
    // If paused, resume
    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // If already have audio cached, replay
    if (blobUrlRef.current && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Generate new audio from server
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ text, readerStyle }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setLoading(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-sm">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {t('voiceReader.generating')}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isPlaying ? (
        <>
          <button
            onClick={handlePause}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
          >
            <Pause className="w-3.5 h-3.5" />
            {t('voiceReader.pause')}
          </button>
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-colors text-sm"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-0.5 ml-1">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-0.5 bg-purple-400 rounded-full animate-pulse"
                style={{ height: `${8 + Math.random() * 8}px`, animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }}
              />
            ))}
          </div>
        </>
      ) : isPaused ? (
        <>
          <button
            onClick={handlePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
          >
            <Play className="w-3.5 h-3.5" />
            {t('voiceReader.resume')}
          </button>
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-colors text-sm"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <div className="relative">
          <button
            onClick={handlePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${ready ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'}`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {t('voiceReader.voiceReading')}
          </button>
          {showWaitTip && (
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-gray-800 text-yellow-400 text-xs rounded-lg border border-yellow-600/30 z-10">
              ⏳ {t('voiceReader.generatingTip')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceReader;
