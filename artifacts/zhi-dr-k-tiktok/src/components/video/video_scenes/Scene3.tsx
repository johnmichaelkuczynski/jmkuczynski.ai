import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

export default function Scene3() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col justify-center px-10 relative overflow-hidden">
      
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      
      <motion.div 
        className="absolute w-[100vw] h-[100vw] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(69,162,158,0.1) 0%, rgba(11,12,16,0) 70%)',
          top: '50%',
          right: '-25%',
          transform: 'translateY(-50%)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      <div className="z-10 w-full flex flex-col gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-widest font-mono text-[4vw]">
            PROLIFIC OUTPUT
          </VideoText>
        </motion.div>

        <div className="flex flex-col gap-12 w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="border-l-4 border-[#45A29E] pl-6"
          >
            <VideoText as="p" scale="body" className="text-[#C5C6C7] text-[5vw] font-medium leading-tight mb-2">
              Author of
            </VideoText>
            <VideoText as="h1" scale="display" className="text-white font-bold text-[14vw] leading-none mb-1">
              218
            </VideoText>
            <VideoText as="p" scale="body" className="text-[#C5C6C7] text-[5vw] font-medium leading-none">
              peer-reviewed publications
            </VideoText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 2.5 }}
            className="border-l-4 border-[#45A29E] pl-6"
          >
            <VideoText as="p" scale="body" className="text-[#C5C6C7] text-[5vw] font-medium leading-tight mb-2">
              Creator of
            </VideoText>
            <VideoText as="h1" scale="display" className="text-white font-bold text-[14vw] leading-none mb-1">
              58
            </VideoText>
            <VideoText as="p" scale="body" className="text-[#C5C6C7] text-[5vw] font-medium leading-none">
              AI-powered courses
            </VideoText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 4.5 }}
            className="border-l-4 border-[#45A29E] pl-6"
          >
            <VideoText as="p" scale="body" className="text-[#C5C6C7] text-[5vw] font-medium leading-tight mb-2">
              and
            </VideoText>
            <VideoText as="h1" scale="display" className="text-white font-bold text-[14vw] leading-none mb-1">
              42
            </VideoText>
            <VideoText as="p" scale="body" className="text-[#C5C6C7] text-[5vw] font-medium leading-none">
              AI applications
            </VideoText>
          </motion.div>
        </div>

      </div>
    </SceneLayout>
  );
}