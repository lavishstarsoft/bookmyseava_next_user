import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import audioFile from "@/assets/AUD-20260108-WA0008.mp3";
import { useLocation } from "react-router-dom"; // Import useLocation

import { useAppConfig } from "@/hooks/useAppConfig"; // Import hook

const FloatingAudioPlayer = () => {
  const config = useAppConfig(); // Fetch config
  const location = useLocation(); // Get location
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showPlayer, setShowPlayer] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use dynamic URL or fallback
  const audioSource = config?.audioStreamUrl || audioFile;

  // Auto-play on component mount with persistence check
  useEffect(() => {
    // Wait for config to load or default fallback
    if (!audioSource) return;

    const storedState = localStorage.getItem("bms_audio_should_play");
    // ... rest of useEffect
    // Default to true (autoplay) only if nothing is stored
    const shouldPlay = storedState === null ? true : JSON.parse(storedState);

    if (audioRef.current) {
      audioRef.current.volume = volume;

      if (shouldPlay) {
        // Try to autoplay
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              // Autoplay was prevented, user needs to click to play
              console.log("Autoplay prevented:", error);
              setIsPlaying(false);
              // We don't update localStorage here because the INTENT was to play
            });
        }
      } else {
        // User previously paused it, so we respect that
        setIsPlaying(false);
      }
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        localStorage.setItem("bms_audio_should_play", JSON.stringify(false));
      } else {
        audioRef.current.play();
        localStorage.setItem("bms_audio_should_play", JSON.stringify(true));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  // Hide on Profile and Pooja Detail pages
  if (location.pathname === '/profile' || location.pathname.startsWith('/pooja/') || location.pathname.startsWith('/pooja-kit')) return null;

  if (!showPlayer) return null;

  return (
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={audioSource}
      />

      {/* Floating Audio Player - Modern Card Design */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed right-3 top-1/2 -translate-y-1/2 md:right-6 z-50"
      >
        <motion.div
          className="relative md:bg-gradient-to-br md:from-white md:via-white md:to-marigold/10 md:backdrop-blur-xl md:rounded-2xl md:shadow-2xl md:border-2 md:border-marigold/30 overflow-hidden"
          style={{ width: '70px' }}
          whileHover={{ width: '280px' }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Animated Gradient Background - Desktop only */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-marigold/10 via-spiritual-green/10 to-maroon/10 opacity-50 hidden md:block"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            style={{ backgroundSize: '200% 200%' }}
          />

          {/* Glow Effect when playing - Desktop only */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-marigold/20 via-spiritual-green/20 to-marigold/20 hidden md:block"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div className="relative z-10 p-3 md:p-[0.5rem] flex items-center gap-3 md:gap-4">
            {/* Main Play Button with Equalizer */}
            <div className="relative flex-shrink-0">
              <motion.button
                onClick={togglePlay}
                className={`w-14 h-14 md:w-12 md:h-12 rounded-full shadow-xl md:shadow-lg hover:shadow-2xl flex items-center justify-center relative overflow-hidden group md:ring-0 ${isPlaying
                  ? 'bg-gradient-to-br from-spiritual-green to-spiritual-green/90 md:from-marigold md:to-marigold-light'
                  : 'bg-gradient-to-br from-marigold to-marigold-light'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isPlaying ? {
                  y: [0, -3, 0],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {/* Pulse Animation */}
                {isPlaying && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/20"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/30"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                    />
                  </>
                )}

                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className={`w-6 h-6 md:w-5 md:h-5 drop-shadow-lg ${isPlaying ? 'text-maroon-dark md:text-white' : 'text-white'}`} />
                  ) : (
                    <Play className="w-6 h-6 md:w-5 md:h-5 text-white drop-shadow-lg ml-1" />
                  )}
                </div>

                {/* Music Note Indicator - Mobile only */}
                <motion.div
                  className="absolute -top-1 -right-1 md:hidden w-5 h-5 bg-marigold rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
                  animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-[10px]">🎵</span>
                </motion.div>
              </motion.button>

              {/* Sound Wave Indicator - Mobile only, when playing */}
              {isPlaying && (
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex gap-1 md:hidden">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-maroon to-maroon-dark rounded-full"
                      animate={{
                        height: ['8px', '18px', '8px'],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Floating Petals/Blessings Animation - Only when playing - Hide on mobile */}
              {isPlaying && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`petal-${i}`}
                      className="absolute pointer-events-none hidden md:block"
                      style={{
                        left: '50%',
                        bottom: '100%',
                      }}
                      initial={{
                        opacity: 0,
                        y: 0,
                        x: 0,
                        rotate: 0,
                        scale: 0
                      }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        y: [-10, -40 - i * 10],
                        x: [(i - 2) * 15, (i - 2) * 20],
                        rotate: [0, 360 * (i % 2 ? 1 : -1)],
                        scale: [0, 1, 0.8, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeOut"
                      }}
                    >
                      <div className="text-lg">
                        {['🙏', '🪔', '🌺', '✨', '🕉️'][i]}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {/* Glowing Ring Animation below button */}
              {isPlaying && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 md:w-16 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #FEB703, #00BD40, #FEB703, transparent)',
                    filter: 'blur(2px)'
                  }}
                  animate={{
                    scaleX: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Equalizer Bars - Only visible when playing */}
              {isPlaying && (
                <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-spiritual-green to-marigold rounded-full"
                      animate={{
                        height: ['4px', '12px', '4px'],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Expanded Controls */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              className="flex-1 flex flex-col gap-2 overflow-hidden"
            >
              {/* Title */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <motion.p
                    className="text-xs font-bold text-maroon-dark truncate"
                    animate={isPlaying ? { opacity: [0.7, 1, 0.7] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isPlaying ? "🎵 Playing Devotional Music" : "Devotional Music"}
                  </motion.p>
                  <p className="text-[10px] text-muted-foreground">Book My Seva</p>
                </div>

                <button
                  onClick={() => setShowPlayer(false)}
                  className="w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Volume Control */}
                <button
                  onClick={toggleMute}
                  className="w-6 h-6 rounded-full hover:bg-spiritual-green/10 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-spiritual-green" />
                  )}
                </button>

                {/* Volume Slider */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #00BD40 0%, #00BD40 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              {/* Waveform Animation */}
              <div className="flex items-center justify-center gap-0.5 h-6">
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-gradient-to-t from-marigold via-spiritual-green to-marigold rounded-full"
                    animate={isPlaying ? {
                      height: ['4px', `${Math.random() * 16 + 8}px`, '4px'],
                    } : { height: '4px' }}
                    transition={{
                      duration: 0.6,
                      repeat: isPlaying ? Infinity : 0,
                      delay: i * 0.05,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Gradient Line - Desktop only */}
          <motion.div
            className="hidden md:block absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-marigold to-transparent"
            animate={isPlaying ? {
              opacity: [0.3, 1, 0.3],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Floating Text Indicator */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -top-12 right-0 bg-spiritual-green text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg hidden md:block"
          >
            🎶 Now Playing
            <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-spiritual-green" />
          </motion.div>
        )}
      </motion.div>

      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #00BD40;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #00BD40;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default FloatingAudioPlayer;
