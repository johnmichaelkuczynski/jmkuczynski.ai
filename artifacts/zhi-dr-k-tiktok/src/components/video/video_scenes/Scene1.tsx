import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene1() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Dynamic Background Image */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 9.5, ease: "easeOut" }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/bg-neural.jpg`}
          className="w-full h-full object-cover mix-blend-screen"
          alt=""
        />
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/80 via-transparent to-[#0B0C10]" />
      </motion.div>

      <div className="flex flex-col items-center justify-center w-full z-10 gap-8 h-full px-6">
        
        <motion.div
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="h-[1px] w-12 bg-[#45A29E] mb-3" />
          <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-[0.3em] font-mono font-bold text-[3.5vw]">
            INTRODUCING
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 1 }}
          className="w-[55vw] h-[55vw] relative rounded-full overflow-hidden border border-[#45A29E]/50 shadow-[0_0_80px_rgba(69,162,158,0.25)]"
        >
          <motion.img 
            src={`${import.meta.env.BASE_URL}images/JM_AVATAR_1788714050625.png`}
            className="w-full h-full object-cover"
            animate={{ scale: [1.2, 1] }}
            transition={{ duration: 8, ease: "easeOut" }}
          />
          {/* Inner ring glow */}
          <div className="absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 2.2 }}
          className="flex flex-col items-center mt-2 text-center"
        >
          <VideoText as="h1" scale="heading" className="text-white font-bold leading-[1.1] mb-4 text-[9vw]">
            Dr. John-Michael<br/>Kuczynski, PhD
          </VideoText>
          
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 3.5 }}
            className="overflow-hidden whitespace-nowrap border-b border-[#45A29E]/30 pb-2"
          >
            <VideoText as="p" scale="body" className="text-[#C5C6C7] tracking-wider font-sans text-[4vw]">
              SENIOR PRODUCT ENGINEER
            </VideoText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "linear", delay: 4.8 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <VideoText as="p" scale="caption" className="text-white/40 tracking-[0.2em] font-mono text-[2.5vw]">
              AT
            </VideoText>
            <img 
              src={`${import.meta.env.BASE_URL}images/zhi-systems-logo.png`} 
              alt="Zhi Systems Logo"
              className="h-10 object-contain opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          </motion.div>
        </motion.div>

      </div>
    </SceneLayout>
  );
}