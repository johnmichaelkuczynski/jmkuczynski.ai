import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

const CREATIONS = [
  "Genius 101", 
  "GPTByPass", 
  "Intelligence Meter", 
  "Freud GPT",
  "IQ Booster", 
  "NeuroText", 
  "Originality Meter", 
  "Mind Profiler",
  "Model Transformer", 
  "Photo Psychoanalysis", 
  "Living Book Maker",
  "Original EZ Reader", 
  "Podcast Creator", 
  "Genius Dictation",
  "FrameWise", 
  "Graphic Novel Creator"
];

export default function Scene4() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col py-16 px-6 relative overflow-hidden">
      
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      
      <div className="z-10 w-full flex flex-col h-full items-center justify-center">
        
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 shrink-0 w-full px-2"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[2px] w-8 bg-[#45A29E]" />
            <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-widest font-mono text-[3.5vw]">
              PRODUCT ROLL CALL
            </VideoText>
          </div>
        </motion.div>

        {/* Slow staggering list of 16 products over ~10 seconds */}
        <div className="flex flex-wrap gap-x-3 gap-y-4 justify-center content-start w-full overflow-visible mt-2">
          {CREATIONS.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1], 
                delay: 0.5 + (i * 0.7) // Staggered over ~11 seconds
              }}
              className="bg-[#1F2833]/90 border border-[#45A29E]/30 rounded-full px-5 py-3 shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
            >
              <VideoText as="p" scale="body" className="text-white font-display font-medium text-[4vw] whitespace-nowrap">
                {item}
              </VideoText>
            </motion.div>
          ))}
        </div>
      </div>
    </SceneLayout>
  );
}