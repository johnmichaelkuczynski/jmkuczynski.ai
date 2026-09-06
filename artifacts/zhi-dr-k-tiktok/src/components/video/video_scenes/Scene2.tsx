import { motion } from 'framer-motion';
import { SceneLayout, VideoText } from '@/lib/video';
import { useEffect, useState } from 'react';

export default function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <SceneLayout className="bg-[#0B0C10] flex flex-col justify-center px-12 relative overflow-hidden">
      
      {/* Background elements */}
      <motion.div 
        className="absolute inset-0 bg-noise opacity-5 pointer-events-none"
      />
      
      <motion.div 
        className="absolute w-[200vw] h-[100vh] border border-[#45A29E]/10"
        style={{
          background: 'linear-gradient(180deg, rgba(69,162,158,0) 0%, rgba(69,162,158,0.05) 50%, rgba(11,12,16,0) 100%)',
          top: 0,
          left: '-50vw'
        }}
        initial={{ y: "100vh" }}
        animate={{ y: phase >= 1 ? "-100vh" : "100vh" }}
        transition={{ duration: 4, ease: "linear" }}
      />

      {/* Grid pattern for the tech phase */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #1F2833 1px, transparent 1px), linear-gradient(to bottom, #1F2833 1px, transparent 1px)`,
          backgroundSize: '4vw 4vw'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 0.3 : 0 }}
        transition={{ duration: 1 }}
      />

      <div className="z-10 w-full flex flex-col gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <VideoText as="h2" scale="heading" className="text-[#C5C6C7] font-serif italic text-[8vw] leading-tight">
            A former<br/>professor of<br/>
            <span className="text-white not-italic font-display font-medium text-[10vw]">PHILOSOPHY</span>
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, height: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, height: "auto", y: 0 } : { opacity: 0, height: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex items-center justify-start gap-4 py-4"
        >
          <div className="h-[2px] w-12 bg-[#45A29E]" />
          <VideoText as="p" scale="caption" className="text-[#45A29E] tracking-widest font-mono">
            TRANSITIONED TO
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          animate={phase >= 1 ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: 50, filter: "blur(10px)" }}
          exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <VideoText as="h1" scale="display" className="text-white font-bold leading-none text-[16vw] text-gradient-primary">
            TECH
          </VideoText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 border-l-4 border-[#45A29E] pl-6"
        >
          <VideoText as="p" scale="body" className="text-[#C5C6C7] text-[4.5vw] font-sans leading-relaxed">
            Transitioning his deep analytical skills to product engineering.
          </VideoText>
          <VideoText as="p" scale="body" className="text-white text-[4.5vw] font-sans leading-relaxed mt-2">
            Keeping <span className="font-bold">Zhi Systems</span> cutting edge.
          </VideoText>
        </motion.div>

      </div>
    </SceneLayout>
  );
}
