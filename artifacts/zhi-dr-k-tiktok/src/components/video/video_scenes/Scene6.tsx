import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene6() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden px-8">
      
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />

      <div className="z-10 w-full flex flex-col items-center justify-center gap-12 text-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <div className="bg-[#45A29E] py-6 w-full rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(69,162,158,0.4)]">
            <VideoText as="h1" scale="heading" className="text-[#0B0C10] text-[7vw] font-bold tracking-wide font-display">
              JMKUCZYNSKI.AI
            </VideoText>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 1 }}
            className="mt-6"
          >
            <VideoText as="p" scale="caption" className="text-[#C5C6C7] tracking-[0.2em] font-mono text-[4vw]">
              ZHISYSTEMS.AI
            </VideoText>
          </motion.div>
        </motion.div>
      </div>
    </SceneLayout>
  );
}