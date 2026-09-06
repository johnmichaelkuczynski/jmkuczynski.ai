import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene5() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Intense Energy Background */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 10, ease: "easeOut" }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/bg-energy.jpg`}
          className="w-full h-full object-cover mix-blend-screen"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-[#0B0C10]/80" />
      </motion.div>

      <div className="z-10 w-full flex flex-col items-center justify-center gap-16 px-8 text-center h-full">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Quote marks */}
          <div className="absolute -top-12 -left-6 text-[#45A29E]/30 font-serif text-[20vw] leading-none pointer-events-none">&ldquo;</div>
          
          <VideoText as="h2" scale="heading" className="text-white font-serif italic text-[8.5vw] leading-tight text-[#C5C6C7] relative z-10">
            Scholarly depth<br/>
            <span className="text-[6vw] text-[#45A29E] font-sans not-italic tracking-wider uppercase block my-3">&amp;</span>
            relentless<br/>invention
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}
          className="flex flex-col items-center gap-6 w-full"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="h-[1px] flex-1 bg-[#45A29E]/40" />
            <VideoText as="p" scale="caption" className="text-[#C5C6C7] text-[3.5vw] tracking-widest font-mono shrink-0">
              KEEPING
            </VideoText>
            <div className="h-[1px] flex-1 bg-[#45A29E]/40" />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full shadow-[0_0_40px_rgba(69,162,158,0.15)]"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/zhi-systems-logo.png`} 
              alt="Zhi Systems Logo"
              className="w-full object-contain"
            />
          </motion.div>

          <VideoText as="p" scale="caption" className="text-[#45A29E] text-[4.5vw] font-bold tracking-widest font-mono mt-2">
            AT THE CUTTING EDGE
          </VideoText>
        </motion.div>

      </div>
    </SceneLayout>
  );
}