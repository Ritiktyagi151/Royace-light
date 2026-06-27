"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { categoryHref, FALLBACK_CATEGORIES } from '@/lib/publicCategories';
import { SITE_CONTACT, mailTo } from '@/lib/contact';

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
  { label: 'Residential Projects', href: '/shop?project=residential' },
  { label: 'Hotel & Villa Lighting', href: '/shop?project=hospitality' },
  { label: 'Installation Support', href: '/contact-us' },
];

const FOOTER_STATS = [
  { value: '2012', label: 'Since' },
  { value: '500+', label: 'Projects' },
  { value: 'PAN India', label: 'Delivery' },
];

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
    <footer style={{ background: 'var(--obsidian)', borderTop: '1px solid rgba(250,247,240,0.06)' }}>
      {/* Top CTA band */}
      <div
        style={{
          borderBottom: '1px solid rgba(250,247,240,0.06)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at center, rgba(0,96,57,0.06) 0%, transparent 70%)',
        }}
      >
        <p className="overline-text" style={{ marginBottom: '1rem' }}>Commission a Piece</p>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--ivory)',
            marginBottom: '1.75rem',
          }}
        >
          Illuminate Your{' '}
          <em style={{ color: 'var(--gold-light)' }}>Finest Spaces</em>
        </h3>
        <Link href="/bespoke" className="btn-primary" style={{ fontSize: '0.58rem' }}>
          Begin a Commission
        </Link>
      </div>

      {/* Main footer grid */}
      <div
        className="max-w-7xl mx-auto footer-grid"
        style={{ padding: '4rem 1.5rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}
      >
        {/* Brand col */}
        <div className="footer-brand-col" style={{ gridColumn: 'span 3' }}>
          <Link href="/" className="mb-5 block w-fit" aria-label="Royace Lighting home">
            <Image
              src="/royace-logo.png"
              alt="Royace"
              width={220}
              height={78}
              className="h-auto w-[170px] sm:w-[210px]"
            />
          </Link>
          <div
            className="hidden"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem',
              fontWeight: 400,
              letterSpacing: '0.18em',
              color: 'var(--ivory)',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>✦</span>
            Royace
            <span style={{ color: 'rgba(250,247,240,0.25)' }}>·</span>
            Lighting
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'rgba(250,247,240,0.9)',
              lineHeight: 1.9,
              fontWeight: 300,
              letterSpacing: '0.04em',
              marginBottom: '2rem',
              maxWidth: '260px',
            }}
          >
            Purveyors of handcrafted luxury lighting since 2012. Each piece an heirloom, crafted in our New Delhi atelier.
          </p>

          <div className="mb-8 grid max-w-[300px] grid-cols-1 gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-[rgba(250,247,240,0.58)] sm:grid-cols-2">
            {['Custom sizing', 'Premium finishes', 'Project support', 'Pan-India delivery'].map((item) => (
              <span key={item} className="border border-white/10 bg-white/[0.03] px-3 py-2">
                {item}
              </span>
            ))}
          </div>

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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { Icon: Instagram, href: '#' },
              { Icon: Facebook, href: '#' },
              { Icon: Twitter, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="btn-icon"
                style={{ width: 36, height: 36 }}
              >
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="footer-links-col" style={{ gridColumn: 'span 2' }}>
          <h4
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}
          >
            Collections
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {visibleCollections.map((item) => (
              <li key={`${item.label}-${item.href}`}>
                <Link
                  href={item.href}
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(250,247,240,0.9)',
                    textDecoration: 'none',
                    letterSpacing: '0.06em',
                    fontWeight: 300,
                    transition: 'color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.9)')}
                >
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
        <div className="footer-links-col" style={{ gridColumn: 'span 2' }}>
          <h4
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}
          >
            Information
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {INFO_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(250, 247, 240, 0.91)',
                    textDecoration: 'none',
                    letterSpacing: '0.06em',
                    fontWeight: 300,
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.9)')}
                >
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
        <div className="footer-links-col" style={{ gridColumn: 'span 2' }}>
          <h4
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}
          >
            Services
          </h4>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {SERVICE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.72rem] font-light tracking-[0.06em] text-[rgba(250,247,240,0.9)] no-underline transition hover:text-[var(--gold)]"
                >
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
        <div className="footer-links-col" style={{ gridColumn: 'span 3' }}>
          <h4
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}
          >
            Atelier
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Mail size={13} style={{ color: 'var(--gold)', marginTop: '0.15rem', flexShrink: 0 }} strokeWidth={1.5} />
              <Link
                href={mailTo('Royace Lighting enquiry')}
                style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.9)', letterSpacing: '0.04em', fontWeight: 300, textDecoration: 'none' }}
              >
                {SITE_CONTACT.email}
              </Link>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Phone size={13} style={{ color: 'var(--gold)', marginTop: '0.15rem', flexShrink: 0 }} strokeWidth={1.5} />
              <Link
                href={SITE_CONTACT.phoneHref}
                style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.9)', letterSpacing: '0.04em', fontWeight: 300, textDecoration: 'none' }}
              >
                {SITE_CONTACT.phone}
              </Link>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin size={13} style={{ color: 'var(--gold)', marginTop: '0.15rem', flexShrink: 0 }} strokeWidth={1.5} />
              <Link
                href={SITE_CONTACT.mapUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.9)', letterSpacing: '0.04em', fontWeight: 300, lineHeight: 1.7, textDecoration: 'none' }}
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
        style={{
          borderTop: '1px solid rgba(250,247,240,0.06)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.2)', letterSpacing: '0.1em' }}>
          © 2026 Royace Lighting. All rights reserved.
        </p>
        <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.2)', letterSpacing: '0.1em' }}>
        Design and Developed by <a href="https://www.jaikvik.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Jaikvik Technology India Pvt Ltd</a>
        </p>
      </div>
    </footer>
  );
}
