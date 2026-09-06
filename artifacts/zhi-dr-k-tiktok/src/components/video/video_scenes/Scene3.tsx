import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene3() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col justify-center px-8 relative overflow-hidden">
      
      {/* Dynamic Background Image */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 9, ease: "easeOut" }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/bg-neural.jpg`}
          className="w-full h-full object-cover mix-blend-screen"
          style={{ objectPosition: 'left center' }}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-[#0B0C10]/50" />
      </motion.div>

      <div className="z-10 w-full flex flex-col gap-12 items-center">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex items-center justify-center gap-4 mb-4"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#45A29E]/50" />
          <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-widest font-mono font-bold text-[3.5vw]">
            PROLIFIC OUTPUT
          </VideoText>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#45A29E]/50" />
        </motion.div>

        <div className="flex flex-col gap-10 w-full max-w-[80vw]">
          
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateX: 45 }}
            animate={{ opacity: 1, x: 0, rotateX: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="bg-[#1F2833]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#45A29E] to-transparent" />
            <VideoText as="p" scale="caption" className="text-[#C5C6C7] text-[4vw] tracking-wider font-mono mb-1">
              AUTHOR OF
            </VideoText>
            <VideoText as="h1" scale="display" className="text-white font-bold text-[14vw] leading-none text-gradient-primary">
              218
            </VideoText>
            <VideoText as="h2" scale="heading" className="text-white font-serif italic text-[6vw] mt-2">
              peer-reviewed publications
            </VideoText>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateX: 45 }}
            animate={{ opacity: 1, x: 0, rotateX: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 2.5 }}
            className="bg-[#1F2833]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden self-end w-full"
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#66FCF1] to-transparent" />
            <VideoText as="p" scale="caption" className="text-[#C5C6C7] text-[4vw] tracking-wider font-mono mb-1 text-right">
              CREATOR OF
            </VideoText>
            <VideoText as="h1" scale="display" className="text-white font-bold text-[14vw] leading-none text-right">
              58
            </VideoText>
            <VideoText as="h2" scale="heading" className="text-white font-serif italic text-[6vw] mt-2 text-right">
              AI-powered courses
            </VideoText>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 4.5 }}
            className="bg-[#0B0C10]/90 backdrop-blur-xl border border-[#45A29E]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(69,162,158,0.2)] text-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#45A29E]/10 to-transparent rounded-2xl" />
            <VideoText as="p" scale="caption" className="text-[#C5C6C7] text-[4vw] tracking-wider font-mono mb-1">
              AND
            </VideoText>
            <VideoText as="h1" scale="display" className="text-white font-bold text-[16vw] leading-none text-gradient-primary">
              42
            </VideoText>
            <VideoText as="h2" scale="heading" className="text-white font-display font-medium text-[6.5vw] mt-2">
              AI Applications
            </VideoText>
          </motion.div>

        </div>
      </div>
    </SceneLayout>
  );
}