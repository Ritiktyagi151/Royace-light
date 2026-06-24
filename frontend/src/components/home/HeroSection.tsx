'use client';

import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative left-1/2 h-[85vh] w-screen -translate-x-1/2 overflow-hidden bg-obsidian text-ivory">
      <motion.video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero-video.mp4"
        // poster="/images/royace-logo.png"
        autoPlay
        muted
        loop
        playsInline
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </section>
  );
}
