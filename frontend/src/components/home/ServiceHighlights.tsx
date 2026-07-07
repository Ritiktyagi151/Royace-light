import type { LucideIcon } from 'lucide-react';
import { Headphones, MailCheck, RotateCcw, Truck } from 'lucide-react';
import { SITE_CONTACT } from '@/lib/contact';

type Highlight = {
  title: string;
  detail: string;
  Icon: LucideIcon;
};

const highlights: Highlight[] = [
  {
    title: 'Give Us A Call',
    detail: SITE_CONTACT.phone,
    Icon: Headphones,
  },
  {
    title: 'Pan India Shipping',
    detail: 'On eligible orders',
    Icon: Truck,
  },
  {
    title: 'Easy Returns',
    detail: 'Simple support process',
    Icon: RotateCcw,
  },
  {
    title: '24 / 7 Support',
    detail: SITE_CONTACT.email,
    Icon: MailCheck,
  },
];

export function ServiceHighlights() {
  return (
    <section className="relative isolate overflow-hidden border-y border-[#006039]/12 bg-[#e3efdc] px-4 py-10 text-[#173126] sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-20 bg-[url('/images/green-texture.png')] bg-cover bg-center" />
      <div className="absolute inset-0 -z-10 bg-[#e8f2e2]/72" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map(({ title, detail, Icon }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#006039]/30 bg-white/45 text-[#006039] shadow-[0_10px_28px_rgba(0,96,57,0.08)]">
              <Icon size={29} strokeWidth={1.65} />
            </span>
            <h3 className="text-base font-bold leading-tight text-[#111827] sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#173126]/72">
              {detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
