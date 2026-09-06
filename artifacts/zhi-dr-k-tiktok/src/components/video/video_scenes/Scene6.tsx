import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene6() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden px-8">
      
      {/* Background Neural lingering */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen grayscale"
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 7, ease: "linear" }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/bg-neural.jpg`}
          className="w-full h-full object-cover"
          alt=""
        />
      </motion.div>

      <div className="z-10 w-full flex flex-col items-center justify-center gap-12 text-center h-full">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 w-full relative"
        >
          {/* Intense final glow */}
          <div className="absolute inset-0 bg-[#45A29E]/20 blur-[60px] -z-10 rounded-full" />
          
          <div className="bg-[#1F2833]/90 backdrop-blur-xl py-8 px-4 w-full rounded-3xl border border-[#45A29E]/50 shadow-[0_20px_60px_rgba(69,162,158,0.3)]">
            <VideoText as="h1" scale="heading" className="text-white text-[8.5vw] font-bold tracking-wider font-display text-gradient-primary">
              JMKUCZYNSKI.AI
            </VideoText>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 1 }}
            className="mt-4 flex flex-col items-center gap-4"
          >
            <div className="h-[1px] w-24 bg-[#45A29E]/50" />
            <VideoText as="p" scale="caption" className="text-[#C5C6C7] tracking-[0.25em] font-mono text-[4vw]">
              ZHISYSTEMS.AI
            </VideoText>
          </motion.div>
        </motion.div>

      </div>
    </SceneLayout>
  );
}