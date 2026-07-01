import Link from "next/link";
import { SectionReveal } from "./SectionReveal";

export default function ExperienceStoresSection() {
  return (
    <SectionReveal direction="right" className="relative mt-8 overflow-hidden bg-[#dfe8d8] bg-[url('/images/green-texture.png')] bg-cover bg-center py-16 lg:mt-16 lg:py-12">
      {/* Left Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-xl py-10 lg:py-16">
          <h2 className="font-serif text-[48px] leading-none text-[#3a2a1d] sm:text-[60px] lg:text-[86px]">
            Experience Stores
          </h2>

          <p className="mt-4 text-sm uppercase tracking-[0.6em] text-[#3a2a1d]/80 lg:text-lg">
            ACROSS INDIA
          </p>

          <p className="mt-10 text-xl text-[#3a2a1d] lg:text-[24px]">
            Spaces Designed To Inspire
          </p>

          <Link
            href="/stores"
            className="mt-10 inline-flex bg-[#3d2d22] px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] text-white transition hover:bg-[#281d15]"
          >
            Visit Our Stores
          </Link>
        </div>
      </div>

      {/* Floating Video */}
      <div className="absolute inset-0 hidden lg:block">
        <div className="absolute right-6 top-6 w-[520px] xl:right-10 xl:w-[680px] 2xl:w-[760px]">
          <div className="overflow-hidden border-[5px] border-[#8a7355] bg-white shadow-2xl">
            <video
              src="/videos/store-video.mp4"
              poster="/images/store-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Video */}
      <div className="mt-12 px-6 lg:hidden">
        <div className="overflow-hidden border-[4px] border-[#8a7355] shadow-xl">
          <video
            src="/videos/hero-video.mp4"
            poster="/images/store-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            controls
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </div>
    </SectionReveal>
  );
}
