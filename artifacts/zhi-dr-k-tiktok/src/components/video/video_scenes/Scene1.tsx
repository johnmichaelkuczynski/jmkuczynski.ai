import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene1() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col items-center justify-center pt-20">
      
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
        transition={{ duration: 10, ease: "linear", repeat: Infinity }}
      />

      <div className="flex flex-col items-center justify-center w-full z-10 gap-8 h-full pb-20">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-1"
        >
          <VideoText 
            as="p" scale="caption" 
            className="text-[#C5C6C7] tracking-[0.2em] font-medium"
          >
            INTRODUCING
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="w-[60vw] h-[60vw] relative rounded-[2rem] overflow-hidden border-2 border-[#45A29E]/30"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(69,162,158,0.2)' }}
        >
          <motion.img 
            src={`${import.meta.env.BASE_URL}images/JM_AVATAR_1788714050625.png`}
            className="w-full h-full object-cover"
            animate={{ scale: [1.2, 1] }}
            transition={{ duration: 3.5, ease: "easeOut" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="flex flex-col items-center mt-4 text-center px-8"
        >
          <VideoText as="h1" scale="display" className="text-white font-bold leading-none mb-4">
            DR.<br/>KUCZYNSKI
          </VideoText>
          <div className="bg-[#1F2833] text-[#45A29E] px-4 py-2 rounded-full border border-[#45A29E]/30 font-sans tracking-wide text-[3vw] font-medium inline-block">
            SENIOR PRODUCT ENGINEER
          </div>
        </motion.div>

      </div>
    </SceneLayout>
  );
}
