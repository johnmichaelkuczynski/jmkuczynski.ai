import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene2() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Neural Grid */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 7 }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/bg-neural.jpg`}
          className="w-full h-full object-cover mix-blend-screen grayscale"
          alt=""
        />
      </motion.div>
      
      {/* 3D Floating Math Sculpture Image */}
      <motion.div
        className="absolute top-[15%] w-[80vw] h-[80vw] z-0 opacity-60 mix-blend-screen"
        initial={{ y: 50, opacity: 0, rotate: -5 }}
        animate={{ 
          y: [0, -20, 0], 
          opacity: [0, 0.7, 0.4],
          rotate: [-5, 5]
        }}
        transition={{ 
          duration: 7, 
          ease: "easeInOut",
          opacity: { duration: 2, ease: "easeOut" }
        }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/math-sculpture.png`}
          alt=""
          className="w-full h-full object-contain"
        />
      </motion.div>

      <div className="z-10 w-full flex flex-col gap-8 px-10 pt-[40vh] items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-[2px] w-16 bg-[#45A29E] mx-auto mb-6" />
          <VideoText as="h2" scale="heading" className="text-[#C5C6C7] font-serif italic text-[7.5vw] leading-tight mb-2">
            Former professor of
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1 }}
          className="relative"
        >
          <VideoText as="h1" scale="display" className="text-white font-display font-bold text-[13vw] leading-[1.1] text-gradient-primary">
            PHILOSOPHY<br/>
            <span className="text-[10vw]">&amp; MATHEMATICS</span>
          </VideoText>
          
          {/* Subtle glow behind text */}
          <div className="absolute inset-0 bg-[#45A29E]/20 blur-[40px] -z-10 rounded-full" />
        </motion.div>

      </div>
    </SceneLayout>
  );
}