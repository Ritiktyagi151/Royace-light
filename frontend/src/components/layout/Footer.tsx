"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { categoryHref, FALLBACK_CATEGORIES } from '@/lib/publicCategories';
import { SITE_CONTACT, mailTo } from '@/lib/contact';
import { buildShopPath } from '@/lib/shopUrls';

const INFO_LINKS = [
  { label: 'About Royace', href: '/about' },
  { label: 'Our Atelier', href: '/atelier' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Refund & Cancellation', href: '/refund-and-cancellation-policy' },
  { label: 'Shipping & Delivery', href: '/shipping-and-delivery-policy' },
];

const SERVICE_LINKS = [
  { label: 'Bespoke Chandeliers', href: '/bespoke' },
  { label: 'Residential Projects', href: buildShopPath({ project: 'residential' }) },
  { label: 'Hotel & Villa Lighting', href: buildShopPath({ project: 'hospitality' }) },
  { label: 'Installation Support', href: '/contact-us' },
];

const FOOTER_STATS = [
  { value: '2012', label: 'Since' },
  { value: '500+', label: 'Projects' },
  { value: 'PAN India', label: 'Delivery' },
];

const footerHeadingClass =
  'mb-6 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[var(--gold)]';

const footerLinkClass =
  'text-[0.72rem] font-light tracking-[0.06em] text-[#faf7f0e6] no-underline transition hover:text-[var(--gold)]';

const iconLinkClass =
  'flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-white/60 transition hover:border-[var(--green-border)] hover:bg-[var(--green-muted)] hover:text-[var(--gold-light)]';

const primaryLinkClass =
  'inline-flex items-center justify-center gap-2 overflow-hidden border border-[var(--gold)] bg-[var(--gold)] px-10 py-4 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--obsidian)] transition-all duration-300 hover:bg-[linear-gradient(135deg,var(--gold-light),var(--gold-deep))] hover:shadow-[var(--glow-gold-sm)]';

export function Footer() {
  const { data: fetchedCategories } = usePublicCategories();
  const collections = useMemo(() => {
    const source = fetchedCategories?.length ? fetchedCategories : FALLBACK_CATEGORIES;
    return source.map((category) => ({
      label: category.name,
      href: categoryHref(category),
    }));
  }, [fetchedCategories]);
  const visibleCollections = collections.slice(0, 8);
  const hasMoreCollections = collections.length > visibleCollections.length;

  return (
    <footer className="border-t border-white/[0.06] bg-[var(--obsidian)]">
      {/* Top CTA band */}
      <div className="border-b border-white/[0.06] bg-[radial-gradient(ellipse_at_center,rgba(0,96,57,0.06)_0%,transparent_70%)] px-6 py-16 text-center">
        <p className="mb-4 text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">Commission a Piece</p>
        <h3 className="mb-7 font-serif text-[clamp(1.8rem,4vw,3rem)] font-light italic text-[var(--ivory)]">
          Illuminate Your{' '}
          <em className="text-[var(--gold-light)]">Finest Spaces</em>
        </h3>
        <Link href="/bespoke" className={primaryLinkClass}>
          Begin a Commission
        </Link>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-12 lg:pb-12">
        {/* Brand col */}
        <div className="lg:col-span-3">
          <Link href="/" className=" block w-fit" aria-label="Royace Lighting home">
            <Image
              src="/royace-logo.png"
              alt="Royace"
              width={220}
              height={50}
              className="h-auto w-[170px] sm:w-[210px]"
            />
          </Link>
         
          <p className="mb-8 max-w-[260px] text-[0.78rem] font-light leading-[1.9] tracking-[0.04em] text-[#faf7f0e6]">
            Purveyors of handcrafted luxury lighting since 2012. Each piece an heirloom, crafted in our New Delhi atelier.
          </p>

          {/* <div className="mb-8 grid max-w-[300px] grid-cols-1 gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-[rgba(250,247,240,0.58)] sm:grid-cols-2">
            {['Custom sizing', 'Premium finishes', 'Project support', 'Pan-India delivery'].map((item) => (
              <span key={item} className="border border-white/10 bg-white/[0.03] px-3 py-2">
                {item}
              </span>
            ))}
          </div> */}

          <div className="mb-8 grid max-w-[320px] grid-cols-3 border border-white/10 bg-white/[0.02]">
            {FOOTER_STATS.map((item) => (
              <div key={item.label} className="border-r border-white/10 px-3 py-4 last:border-r-0">
                <strong className="block font-serif text-base font-normal text-[var(--gold-light)]">
                  {item.value}
                </strong>
                <span className="mt-1 block text-[0.52rem] uppercase tracking-[0.18em] text-white/35">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Socials */}
          <div className="flex gap-2">
            {[
              { Icon: Instagram, href: '#' },
              { Icon: Facebook, href: '#' },
              { Icon: Twitter, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className={iconLinkClass}
                aria-label="Royace social profile"
              >
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="lg:col-span-2">
          <h4 className={footerHeadingClass}>
            Collections
          </h4>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {visibleCollections.map((item) => (
              <li key={`${item.label}-${item.href}`}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {hasMoreCollections && (
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 border border-[rgba(228,199,124,0.35)] px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold-light)] transition hover:border-[var(--gold)] hover:bg-[rgba(228,199,124,0.08)]"
            >
              View All
            </Link>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-2">
          <h4 className={footerHeadingClass}>
            Information
          </h4>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {INFO_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* <div className="mt-7 border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--gold-light)]">
              Bespoke Support
            </p>
            <p className="mb-4 text-[0.7rem] leading-6 text-[rgba(250,247,240,0.62)]">
              Share drawings, room photos, or fixture references and our team will guide finish, size, and installation details.
            </p>
            <Link
              href="/bespoke"
              className="inline-flex text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] transition hover:text-[var(--gold-light)]"
            >
              Begin Enquiry
            </Link>
          </div> */}
        </div>

        {/* Services */}
        <div className="lg:col-span-2">
          <h4 className={footerHeadingClass}>
            Services
          </h4>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {SERVICE_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-7 border border-[rgba(228,199,124,0.18)] bg-[rgba(0,96,57,0.08)] p-4">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--gold-light)]">
              Working Hours
            </p>
            <p className="mt-3 text-[0.7rem] leading-6 text-white/60">
              Monday to Saturday<br />
              10:30 AM - 7:00 PM
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <h4 className={footerHeadingClass}>
            Atelier
          </h4>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            <li className="flex items-start gap-3">
              <Mail size={13} className="mt-0.5 shrink-0 text-[var(--gold)]" strokeWidth={1.5} />
              <Link
                href={mailTo('Royace Lighting enquiry')}
                className={footerLinkClass}
              >
                {SITE_CONTACT.email}
              </Link>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={13} className="mt-0.5 shrink-0 text-[var(--gold)]" strokeWidth={1.5} />
              <Link
                href={SITE_CONTACT.phoneHref}
                className={footerLinkClass}
              >
                {SITE_CONTACT.phone}
              </Link>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={13} className="mt-0.5 shrink-0 text-[var(--gold)]" strokeWidth={1.5} />
              <Link
                href={SITE_CONTACT.mapUrl}
                target="_blank"
                rel="noreferrer"
                className={`${footerLinkClass} leading-7`}
              >
                Mehrauli Road, Qutub Area<br />New Delhi, 110030
              </Link>
            </li>
          </ul>

          <div className="mt-7 space-y-3 text-[0.68rem] leading-6 tracking-[0.04em] text-white/50">
            <p>
              For architects, interior designers, homeowners, and hospitality projects.
            </p>
            <p>
              Custom finishes, scale adjustments, and installation coordination available on request.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto flex max-w-7xl flex-row flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-5"
      >
        <p className="text-[0.62rem] tracking-[0.1em] text-white/20">
          © 2026 Royace Lighting. All rights reserved.
        </p>
        <p className="text-[0.62rem] tracking-[0.1em] text-white/20">
        Design and Developed by <a href="https://www.jaikvik.com" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] no-underline transition hover:text-[var(--gold-light)]">Jaikvik Technology India Pvt Ltd</a>
        </p>
      </div>
    </footer>
  );
}
