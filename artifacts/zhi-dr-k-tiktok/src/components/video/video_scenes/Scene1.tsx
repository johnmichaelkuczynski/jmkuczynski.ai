import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene1() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center pt-24 px-6 relative overflow-hidden">
      
      {/* Background element */}
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      <motion.div 
        className="absolute w-[150vw] h-[150vw] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(69,162,158,0.15) 0%, rgba(11,12,16,0) 70%)',
          top: '-25%',
          left: '-25%'
        }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity }}
      />

      <div className="flex flex-col items-center justify-center w-full z-10 gap-8 h-full pb-20">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="w-[60vw] h-[60vw] relative rounded-[2rem] overflow-hidden border-2 border-[#45A29E]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(69,162,158,0.2)]"
        >
          <motion.img 
            src={`${import.meta.env.BASE_URL}images/JM_AVATAR_1788714050625.png`}
            className="w-full h-full object-cover"
            animate={{ scale: [1.3, 1] }}
            transition={{ duration: 9, ease: "easeOut" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}
          className="flex flex-col items-center mt-2 text-center px-4"
        >
          <VideoText as="h1" scale="heading" className="text-white font-bold leading-tight mb-2 text-[9vw]">
            Dr. John-Michael<br/>Kuczynski, PhD
          </VideoText>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 2.5 }}
            className="bg-[#1F2833] text-[#45A29E] px-5 py-3 mt-4 rounded-full border border-[#45A29E]/30 font-sans tracking-wide text-[4vw] font-medium inline-block"
          >
            SENIOR PRODUCT ENGINEER
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 3.5 }}
            className="mt-10 flex flex-col items-center"
          >
            <VideoText as="p" scale="caption" className="text-[#C5C6C7] tracking-[0.2em] font-mono text-[3vw] mb-3">
              AT
            </VideoText>
            <img 
              src={`${import.meta.env.BASE_URL}images/zhi-systems-logo.png`} 
              alt="Zhi Systems Logo"
              className="h-10 object-contain opacity-90"
            />
          </motion.div>
        </motion.div>

      </div>
    </SceneLayout>
  );
}