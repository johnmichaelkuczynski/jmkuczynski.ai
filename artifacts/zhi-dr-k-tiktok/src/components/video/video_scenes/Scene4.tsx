import { motion, AnimatePresence } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';
import { useEffect, useState } from 'react';

const GROUPS = [
  {
    theme: "COGNITIVE AI",
    image: "ai-brain.png",
    items: ["Genius 101", "GPTByPass", "Intelligence Meter", "Freud GPT"]
  },
  {
    theme: "ANALYTICAL MODELS",
    image: "ai-hologram.png",
    items: ["IQ Booster", "NeuroText", "Originality Meter", "Mind Profiler"]
  },
  {
    theme: "GENERATIVE ENGINES",
    image: "math-sculpture.png",
    items: ["Model Transformer", "Photo Psychoanalysis", "Living Book Maker", "Original EZ Reader"]
  },
  {
    theme: "RICH MEDIA CREATION",
    image: "bg-neural.jpg", // Using as a masked texture
    items: ["Podcast Creator", "Genius Dictation", "FrameWise", "Graphic Novel Creator"]
  }
];

export default function Scene4() {
  const [phase, setPhase] = useState(0);

  // 16s total duration = 4s per group
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 4000);
    const t2 = setTimeout(() => setPhase(2), 8000);
    const t3 = setTimeout(() => setPhase(3), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col pt-12 pb-8 px-6 relative overflow-hidden">
      
      <motion.div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

      {/* Header persists across the whole 16s */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-20 shrink-0 w-full text-center mt-4"
      >
        <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-[0.2em] font-mono text-[3.5vw] font-bold">
          PRODUCT ROLL CALL
        </VideoText>
        <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[#45A29E] to-transparent mx-auto mt-4" />
      </motion.div>

      {/* Rotating Product Groups */}
      <div className="flex-1 w-full relative mt-8 z-10 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`group-${phase}`}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center"
          >
            {/* Theme Illustration */}
            <div className="relative w-[45vw] h-[45vw] mb-8 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 rounded-full bg-[#45A29E]/10 blur-[30px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <img 
                src={`${import.meta.env.BASE_URL}images/${GROUPS[phase].image}`}
                className={`w-full h-full object-contain drop-shadow-[0_0_20px_rgba(69,162,158,0.5)] ${phase === 3 ? 'rounded-full mix-blend-screen mask-radial' : ''}`}
                alt=""
                style={phase === 3 ? { maskImage: 'radial-gradient(circle, black 40%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)' } : {}}
              />
            </div>

            {/* Theme Title */}
            <VideoText as="h2" scale="body" className="text-[#C5C6C7] font-sans tracking-widest text-[3.5vw] mb-6 border-b border-[#45A29E]/30 pb-2">
              {GROUPS[phase].theme}
            </VideoText>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 gap-3 w-full max-w-[85vw]">
              {GROUPS[phase].items.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                  className="bg-gradient-to-r from-[#1F2833]/90 to-[#0B0C10]/90 border border-white/5 rounded-xl px-5 py-4 shadow-lg text-center"
                >
                  <VideoText as="h2" scale="heading" className="text-white font-display font-medium text-[5vw]">
                    {item}
                  </VideoText>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </SceneLayout>
  );
}