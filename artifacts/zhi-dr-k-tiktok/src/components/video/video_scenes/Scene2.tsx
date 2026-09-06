import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene2() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col justify-center px-10 relative overflow-hidden">
      
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      
      {/* Sweeping background line */}
      <motion.div 
        className="absolute w-[2px] h-[150vh] bg-gradient-to-b from-transparent via-[#45A29E]/30 to-transparent"
        style={{ left: '15vw', top: '-25vh' }}
        animate={{ top: ['-25vh', '100vh'] }}
        transition={{ duration: 7, ease: "linear", repeat: Infinity }}
      />

      <div className="z-10 w-full flex flex-col gap-6 items-start pl-8">
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-widest font-mono mb-4 text-[4vw]">
            BACKGROUND
          </VideoText>
          <VideoText as="h2" scale="heading" className="text-white font-serif italic text-[8vw] leading-tight text-[#C5C6C7]">
            Former professor<br/>of
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="mt-4"
        >
          <VideoText as="h1" scale="display" className="text-white font-display font-bold text-[13vw] leading-[1.1] text-gradient-primary">
            PHILOSOPHY<br/>
            &amp; MATHEMATICS
          </VideoText>
        </motion.div>

      </div>
    </SceneLayout>
  );
}