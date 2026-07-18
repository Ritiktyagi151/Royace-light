'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Truck,
  Undo2,
  Youtube,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SITE_CONTACT, mailTo } from '@/lib/contact';

const subjectOptions = ['Product Enquiry', 'Custom Project', 'Order Support', 'Return or Refund', 'General Query'];

const fieldClass =
  'w-full border border-[#e4c77c2e] bg-[#173126cc] px-4 py-3.5 text-[0.84rem] tracking-[0.02em] text-[var(--ivory)] outline-none transition placeholder:text-white/30 focus:border-[#e4c77c85] focus:bg-[#00603929] focus:shadow-[0_0_0_3px_rgba(199,164,90,0.08)]';

const labelClass =
  'grid gap-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--gold-light)]';

const contactCardClass =
  'border border-white/10 bg-white/[0.035] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)]';

const whatsappNumber = SITE_CONTACT.phone.replace(/\D/g, '');
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  'Hi Royace Lighting, I need help with a lighting enquiry.',
)}`;

const mapEmbedSrc =
  'https://www.google.com/maps?q=Royace%20Lighting%202%2F25%20Main%20Road%20Kirti%20Nagar%20Near%20Police%20Station%20New%20Delhi&output=embed';

export function ContactUsClient() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const responseLine = useMemo(
    () => 'We usually respond within 24 working hours, Monday to Saturday.',
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitted(false);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await api.post('/enquiries', {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        source: 'contact-us',
        product: new URLSearchParams(window.location.search).get('product') || undefined,
      });
      setSubmitted(true);
      form.reset();
      setSelectedSubject('');
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || 'Unable to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--obsidian)] text-[var(--ivory)]">
      <section className="relative flex min-h-[520px] overflow-hidden border-b border-white/10 bg-[#071811] px-4 pb-10 pt-28 sm:px-6 lg:h-[560px] lg:px-10 lg:pb-12 lg:pt-28">
        <Image
          src="/images/conatct-us1.png"
          alt="Royace Lighting contact us banner"
          fill
          priority
          sizes="100vw"
          className="object-fill object-center opacity-70"
        />
        {/* <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,12,9,0.86),rgba(6,47,36,0.66)_48%,rgba(5,12,9,0.32)),linear-gradient(180deg,rgba(5,12,9,0.22),rgba(5,12,9,0.74))]" /> */}
        {/* <div className="relative mx-auto grid w-full max-w-7xl gap-8 self-end lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--gold-light)]">
              Contact Us
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-3xl font-light italic leading-none">
              Speak to us for product selection, custom lighting, and order support.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62">
              Connect with our team for chandeliers, pendant lights, wall lights, custom project enquiries, delivery updates, returns, refunds, and store directions.
            </p>
            <p className="mt-4 inline-flex border border-[#e4c77c33] bg-white/[0.04] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--gold-light)]">
              {responseLine}
            </p>
          </div>

          <div className="grid gap-3 border border-white/10 bg-[#173126]/45 p-5 backdrop-blur">
            <ContactLink Icon={Mail} label="Support Email" href={mailTo('Royace Lighting support enquiry')} value={SITE_CONTACT.email} />
            <ContactLink Icon={Phone} label="Phone Support" href={SITE_CONTACT.phoneHref} value={SITE_CONTACT.phone} />
            <ContactLink Icon={MessageCircle} label="WhatsApp" href={whatsappHref} value="Chat on WhatsApp" external />
            <div className="flex items-start gap-3 border-t border-white/10 pt-4">
              <Clock size={16} className="mt-1 shrink-0 text-[var(--gold-light)]" />
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-white/42">Working Hours</p>
                <p className="mt-1 text-sm leading-6 text-white/78">Monday to Saturday, 10:30 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div> */}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-20">
        <div className="grid gap-8">
          <div className={contactCardClass}>
            <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-5">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                  Send Your Enquiry
                </p>
                <h2 className="mt-3 font-serif text-[clamp(1.8rem,4vw,3rem)] font-light italic">
                  Share your requirement with our team.
                </h2>
              </div>
              <Send size={24} className="shrink-0 text-[var(--gold-light)]" />
            </div>

            {submitted && (
              <div className="mt-6 flex gap-3 border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
                <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-300" />
                <p>Thank you. Your enquiry has been received. Our team will contact you shortly.</p>
              </div>
            )}
            {submitError && (
              <div className="mt-6 border border-red-400/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Name
                <input className={fieldClass} name="name" placeholder="Your full name" required />
              </label>
              <label className={labelClass}>
                Email
                <input className={fieldClass} name="email" type="email" placeholder="you@example.com" required />
              </label>
              <label className={labelClass}>
                Phone Number
                <input className={fieldClass} name="phone" type="tel" placeholder="+91 98916 19199" required />
              </label>
              <label className={labelClass}>
                Subject
                <select
                  className={fieldClass}
                  name="subject"
                  required
                  value={selectedSubject}
                  onChange={(event) => setSelectedSubject(event.target.value)}
                >
                  <option value="" disabled>Select a subject</option>
                  {subjectOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#062f24]">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Message
                <textarea
                  className={`${fieldClass} min-h-[150px] resize-y`}
                  name="message"
                  placeholder="Share your order ID, product name, room size, city, timeline, or project requirement."
                  required
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 border border-[var(--gold)] bg-[var(--gold)] px-6 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--obsidian)] transition hover:bg-[var(--gold-light)] sm:col-span-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                <ArrowRight size={15} />
              </button>
            </form>
          </div>

          <div className={contactCardClass}>
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-[var(--gold-light)]" />
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
                Office and Store Address
                </p>
                <h2 className="mt-1 font-serif text-2xl font-light italic">Visit by prior appointment</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/68">{SITE_CONTACT.registeredAddress}</p>
            <div className="mt-5 overflow-hidden border border-white/10 bg-[#173126]/45">
              <iframe
                title="Royace Lighting office location"
                src={mapEmbedSrc}
                className="h-[360px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <Link
              href={SITE_CONTACT.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold-light)] no-underline transition hover:text-[var(--gold)]"
            >
              Open in Google Maps <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <aside className="grid content-start gap-5">
          <div className={contactCardClass}>
            <h2 className="font-serif text-2xl font-light italic">Customer Support</h2>
            <div className="mt-5 grid gap-4">
              <ContactLink Icon={Mail} label="Email" href={mailTo('Royace Lighting support enquiry')} value={SITE_CONTACT.email} />
              <ContactLink Icon={Phone} label="Phone" href={SITE_CONTACT.phoneHref} value={SITE_CONTACT.phone} />
              <ContactLink Icon={MessageCircle} label="WhatsApp" href={whatsappHref} value={SITE_CONTACT.phone} external />
            </div>
          </div>

          <div className={contactCardClass}>
            <h2 className="font-serif text-2xl font-light italic">Follow Us</h2>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.04] text-white/65 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]"
                >
                  <Icon size={17} strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>

          <div className={contactCardClass}>
            <h2 className="font-serif text-2xl font-light italic">Quick Links</h2>
            <div className="mt-5 grid gap-3">
              <QuickLink Icon={Truck} href="/my-orders" label="Track Your Order" />
              <QuickLink Icon={Undo2} href="/refund-and-cancellation-policy" label="Return Policy" />
              <QuickLink Icon={Clock} href="/shipping-and-delivery-policy" label="Shipping Info" />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

type ContactLinkProps = {
  Icon: typeof Mail;
  label: string;
  href: string;
  value: string;
  external?: boolean;
};

function ContactLink({ Icon, label, href, value, external }: ContactLinkProps) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="flex items-start gap-3 no-underline transition hover:translate-x-1"
    >
      <Icon size={17} className="mt-1 shrink-0 text-[var(--gold-light)]" strokeWidth={1.5} />
      <span>
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-white/42">
          {label}
        </span>
        <span className="mt-1 block text-sm leading-6 text-white/82">{value}</span>
      </span>
    </Link>
  );
}

type QuickLinkProps = {
  Icon: typeof Truck;
  href: string;
  label: string;
};

function QuickLink({ Icon, href, label }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/76 no-underline transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]"
    >
      <span className="flex items-center gap-3">
        <Icon size={16} strokeWidth={1.6} />
        {label}
      </span>
      <ArrowRight size={14} />
    </Link>
  );
}
