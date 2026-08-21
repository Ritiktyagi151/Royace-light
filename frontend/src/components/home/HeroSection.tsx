'use client';

import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="hero-video-section relative left-1/2 h-[50vh] w-screen -translate-x-1/2 overflow-hidden bg-obsidian text-ivory">
      <motion.video
        className="hero-video-desktop absolute inset-0 hidden h-full w-full object-cover"
        src="/videos/video-project22.mp4"
        // poster="/images/royace-logo.png"
        autoPlay
        muted
        loop
        playsInline
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.video
        className="hero-video-mobile absolute inset-0 h-full w-full object-cover"
        src="/videos/royace-mobile.mp4"
        autoPlay
        muted
        loop
        playsInline
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="hero-video-caption absolute bottom-0 right-0 z-10 rounded bg-black/65 px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        Shine Smarter
      </motion.div>
    </section>
  );
}
