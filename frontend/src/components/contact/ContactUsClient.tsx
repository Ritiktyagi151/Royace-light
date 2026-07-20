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
  ShieldCheck,
  Sparkles,
  Truck,
  Undo2,
  Youtube,
} from 'lucide-react';
import { SITE_CONTACT, mailTo } from '@/lib/contact';

const subjectOptions = ['Product Enquiry', 'Custom Project', 'Order Support', 'Return or Refund', 'General Query'];

const fieldClass =
  'w-full border border-[#e4c77c2e] bg-[#173126cc] px-4 py-3.5 text-[0.84rem] tracking-[0.02em] text-[var(--ivory)] outline-none transition placeholder:text-white/30 focus:border-[#e4c77c85] focus:bg-[#00603929] focus:shadow-[0_0_0_3px_rgba(199,164,90,0.08)]';

const labelClass =
  'grid gap-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--gold-light)]';

const contactCardClass =
  'border border-white/10 bg-white/[0.035] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)]';

const helpTopics = [
  {
    title: 'Product Selection',
    text: 'Share the room type, ceiling height, room size, preferred finish, and reference images so we can suggest the right chandelier, pendant, wall light, or lamp.',
    Icon: Sparkles,
  },
  {
    title: 'Order Support',
    text: 'For order status, payment, invoice, dispatch, or delivery help, include your order ID, registered phone number, and payment reference if available.',
    Icon: Truck,
  },
  {
    title: 'After-Sales Help',
    text: 'For damaged, wrong, or missing products, contact us within 48 hours with photos, packaging images, invoice copy, and an unboxing video where possible.',
    Icon: ShieldCheck,
  },
];

const enquiryChecklist = [
  'Product name, SKU, or collection link if you have selected an item',
  'Installation city, delivery pin code, and preferred delivery timeline',
  'Room size, ceiling height, false-ceiling status, and site photos for custom lighting',
  'Order ID, invoice, payment screenshot, or tracking details for support requests',
];

const contactFaqs = [
  {
    question: 'How fast will the team respond?',
    answer: 'Most enquiries are reviewed within 24 working hours from Monday to Saturday. Order, payment, and damage reports are prioritised when complete details are shared.',
  },
  {
    question: 'Can I ask for a custom size or finish?',
    answer: 'Yes. Share dimensions, finish preference, colour temperature, reference images, budget range, and timeline. The team will confirm feasibility and pricing.',
  },
  {
    question: 'Should I visit directly?',
    answer: 'Please call or message first. Appointments help us make sure the right team member and product references are available for your visit.',
  },
];

const whatsappNumber = SITE_CONTACT.phone.replace(/\D/g, '');
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  'Hi Royace Lighting, I need help with a lighting enquiry.',
)}`;
const formSubmitEndpoint = `https://formsubmit.co/ajax/${SITE_CONTACT.email}`;

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
      const response = await fetch(formSubmitEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: 'New Royace Lighting website enquiry',
          _template: 'table',
          _captcha: 'false',
          _replyto: formData.get('email'),
          _url: window.location.href,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        source: 'contact-us',
        product: new URLSearchParams(window.location.search).get('product') || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to submit enquiry');
      }

      setSubmitted(true);
      form.reset();
      setSelectedSubject('');
    } catch (error: any) {
      setSubmitError(error?.message || 'Unable to submit enquiry. Please try again.');
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
            <h2 className="font-serif text-2xl font-light italic">Support Hours</h2>
            <div className="mt-5 flex items-start gap-3">
              <Clock size={17} className="mt-1 shrink-0 text-[var(--gold-light)]" strokeWidth={1.5} />
              <div>
                <p className="text-sm leading-6 text-white/82">{SITE_CONTACT.supportTimings}</p>
                <p className="mt-3 text-sm leading-7 text-white/58">{responseLine} For urgent delivery or damage concerns, WhatsApp is usually the fastest option.</p>
              </div>
            </div>
          </div>

          <div className={contactCardClass}>
            <h2 className="font-serif text-2xl font-light italic">Follow Us</h2>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Instagram, href: SITE_CONTACT.instagramUrl, label: 'Instagram' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer' : undefined}
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

      <section className="border-y border-white/10 bg-[#10241b] px-4 py-14 sm:px-6 lg:px-10 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
              Help Us Help You Faster
            </p>
            <h2 className="mt-3 font-serif text-[clamp(1.8rem,4vw,3rem)] font-light italic">
              Add these details in your message.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {helpTopics.map(({ title, text, Icon }) => (
                <article key={title} className={contactCardClass}>
                  <Icon size={19} className="text-[var(--gold-light)]" strokeWidth={1.5} />
                  <h3 className="mt-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/92">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{text}</p>
                </article>
              ))}
            </div>
            <div className={`${contactCardClass} flex flex-col justify-between`}>
              <div>
                <h3 className="font-serif text-2xl font-light italic">Before submitting</h3>
                <ul className="mt-5 grid list-none gap-4 p-0">
                  {enquiryChecklist.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-white/70">
                      <CheckCircle2 size={17} className="mt-1 shrink-0 text-[var(--gold-light)]" strokeWidth={1.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-7 border border-[rgba(228,199,124,0.18)] bg-[rgba(0,96,57,0.12)] p-5">
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[var(--gold-light)]">Damage or missing item?</p>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Keep all packaging safely, avoid installation, and send photos plus video evidence within 48 hours of delivery so the team can review the case properly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
              Quick Answers
            </p>
            <h2 className="mt-3 font-serif text-[clamp(1.8rem,4vw,3rem)] font-light italic">
              Common contact questions.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62">
              These answers cover the details customers most often need before speaking with the Royace team.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {contactFaqs.map((faq) => (
              <article key={faq.question} className={contactCardClass}>
                <h3 className="text-[0.72rem] font-bold uppercase leading-6 tracking-[0.18em] text-white/90">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
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
