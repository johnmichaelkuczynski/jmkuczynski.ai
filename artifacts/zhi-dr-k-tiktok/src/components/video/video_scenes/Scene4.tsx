import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene4() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background elements */}
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      
      <motion.div 
        className="absolute w-[150vw] h-[150vw] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(69,162,158,0.15) 0%, rgba(11,12,16,0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <div className="z-10 w-full flex flex-col items-center justify-center gap-12 px-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <VideoText as="h2" scale="heading" className="text-white font-serif italic text-[6vw] leading-relaxed mb-8 text-[#C5C6C7]">
            "One of the most creative and productive minds in the field."
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-[0_0_50px_rgba(69,162,158,0.2)] w-full flex justify-center border border-[#45A29E]/30"
        >
          <img 
            src={`${import.meta.env.BASE_URL}images/zhi-systems-logo.png`} 
            alt="Zhi Systems Logo"
            className="w-full max-w-[70vw] object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "linear", delay: 1 }}
          className="mt-4"
        >
          <div className="h-[2px] w-20 bg-[#45A29E] mx-auto mb-4" />
          <VideoText as="p" scale="body" className="text-[#45A29E] text-[4.5vw] tracking-[0.2em] font-mono">
            ZHISYSTEMS.AI
          </VideoText>
        </motion.div>

      </div>
    </SceneLayout>
  );
}
