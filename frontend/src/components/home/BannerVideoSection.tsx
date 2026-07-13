import Link from "next/link";

export default function ExperienceStoresSection() {
  return (
    <div className="relative overflow-hidden bg-[#dfe8d8] bg-[url('/images/green-texture.png')] bg-cover bg-center py-16 lg:min-h-[560px] lg:py-12 2xl:min-h-[640px]">
      {/* Left Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-xl py-10 lg:py-16">
          <h2 className="text-5xl font-semibold leading-none text-[#3a2a1d]">
            Experience Stores
          </h2>

          <p className="mt-4 text-sm uppercase tracking-[0.32em] text-[#3a2a1d]/80 sm:tracking-[0.6em] lg:text-lg">
            ACROSS INDIA
          </p>

          <p className="mt-10 text-xl text-[#3a2a1d] lg:text-[24px]">
            Spaces Designed To Inspire
          </p>

          <Link
            href="/shop"
            className="mt-10 inline-flex w-full cursor-pointer justify-center bg-[#3d2d22] px-8 py-4 text-center text-sm font-medium uppercase tracking-[0.15em] text-white transition hover:bg-[#281d15] hover:text-[#8a7355] sm:w-fit"
          >
            View Our Collections
          </Link>
        </div>
      </div>

      {/* Floating Video */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="pointer-events-auto absolute right-6 top-6 w-[520px] xl:right-10 xl:w-[680px] 2xl:w-[760px]">
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
    </div>
  );
}
