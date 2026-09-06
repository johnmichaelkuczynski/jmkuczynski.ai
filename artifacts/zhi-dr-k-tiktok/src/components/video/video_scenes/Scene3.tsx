import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';

const CREATIONS = [
  "GENIUS 101",
  "GPTZERO BYPASS",
  "INTELLIGENCE METER",
  "FREUD GPT",
  "IQ BOOSTER"
];

export default function Scene3() {
  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col justify-center px-10 relative overflow-hidden">
      
      {/* Background elements */}
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      
      {/* Animated nodes background */}
      {CREATIONS.map((_, i) => (
        <motion.div
          key={`node-${i}`}
          className="absolute w-2 h-2 rounded-full bg-[#45A29E]/40 blur-[2px]"
          initial={{ 
            x: `${10 + Math.random() * 80}vw`, 
            y: `${10 + Math.random() * 80}vh`,
            opacity: 0,
            scale: 0
          }}
          animate={{
            y: [`${10 + Math.random() * 80}vh`, `${10 + Math.random() * 80}vh`],
            opacity: [0, 0.5, 0],
            scale: [0, 2, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      <div className="z-10 w-full flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[2px] w-8 bg-[#45A29E]" />
            <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-widest font-mono text-[4vw]">
              PORTFOLIO
            </VideoText>
          </div>
          <VideoText as="h2" scale="heading" className="text-white font-bold leading-tight">
            AMONG HIS<br/>CREATIONS:
          </VideoText>
        </motion.div>

        <div className="flex flex-col gap-4">
          {CREATIONS.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -50, filter: "blur(5px)" }}
              transition={{ 
                duration: 0.6, 
                ease: [0.16, 1, 0.3, 1], 
                delay: 0.8 + (i * 0.3) 
              }}
              className="bg-[#1F2833]/80 border border-[#C5C6C7]/10 backdrop-blur-sm rounded-xl p-4 flex items-center shadow-lg"
            >
              <div className="w-2 h-8 bg-[#45A29E] rounded-full mr-4" />
              <VideoText as="h2" scale="heading" className="text-white font-display font-semibold tracking-wide text-[5.5vw]">
                {item}
              </VideoText>
            </motion.div>
          ))}
        </div>
      </div>
    </SceneLayout>
  );
}
