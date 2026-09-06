import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene5() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden px-8">
      
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      
      <motion.div 
        className="absolute w-[150vw] h-[150vw] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(69,162,158,0.2) 0%, rgba(11,12,16,0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <div className="z-10 w-full flex flex-col items-center justify-center gap-14 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <VideoText as="h2" scale="heading" className="text-white font-serif italic text-[8vw] leading-relaxed text-[#C5C6C7]">
            Scholarly depth &amp;<br/>relentless invention
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "linear", delay: 2.5 }}
          className="flex flex-col items-center gap-6"
        >
          <VideoText as="p" scale="body" className="text-[#45A29E] text-[5vw] tracking-widest font-mono">
            KEEPING
          </VideoText>
          <img 
            src={`${import.meta.env.BASE_URL}images/zhi-systems-logo.png`} 
            alt="Zhi Systems Logo"
            className="w-full max-w-[70vw] object-contain"
          />
          <VideoText as="p" scale="body" className="text-[#45A29E] text-[5vw] tracking-widest font-mono">
            AT THE CUTTING EDGE
          </VideoText>
        </motion.div>

      </div>
    </SceneLayout>
  );
}