import { SITE_CONTACT } from '@/lib/contact';

const whatsappNumber = SITE_CONTACT.phone.replace(/\D/g, '');
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  'Hi Royace Lighting, I would like to enquire about your lighting collections.',
)}`;

export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[clamp(1rem,3vw,1.5rem)] right-[clamp(1rem,3vw,1.5rem)] z-[120] flex h-[54px] w-[54px] items-center justify-center rounded-full border border-white/30 bg-[#25d366] text-white shadow-[0_18px_38px_rgba(0,0,0,0.28)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(0,0,0,0.34)] [&_svg]:h-[30px] [&_svg]:w-[30px]"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M16.04 3.2c-7.02 0-12.73 5.68-12.73 12.66 0 2.23.59 4.41 1.72 6.33L3.2 28.8l6.8-1.78a12.8 12.8 0 0 0 6.04 1.54c7.02 0 12.73-5.68 12.73-12.66S23.06 3.2 16.04 3.2Zm0 23.2c-1.9 0-3.76-.51-5.39-1.48l-.39-.23-4.04 1.06 1.08-3.91-.25-.4a10.43 10.43 0 0 1-1.58-5.58c0-5.78 4.74-10.49 10.57-10.49s10.57 4.71 10.57 10.49-4.74 10.54-10.57 10.54Zm5.8-7.86c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.72.16-.21.32-.82 1.02-1 1.23-.19.21-.37.24-.69.08-.32-.16-1.35-.49-2.57-1.57-.95-.84-1.59-1.88-1.78-2.2-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.72-.98-2.36-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.27 3.45 5.49 4.84.77.33 1.37.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.88-.77 2.15-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z"
        />
      </svg>
    </a>
  );
}
