'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  DraftingCompass,
  Mail,
  MessageCircle,
  Phone,
  Ruler,
  Send,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { SITE_CONTACT } from '@/lib/contact';

type BespokeForm = {
  name: string;
  phone: string;
  email: string;
  role: string;
  city: string;
  projectType: string;
  spaceType: string;
  fixtureType: string;
  quantity: string;
  roomLength: string;
  roomWidth: string;
  ceilingHeight: string;
  dropHeight: string;
  electricalPoint: string;
  style: string;
  finish: string;
  material: string;
  lightTone: string;
  budget: string;
  timeline: string;
  installationHelp: string;
  referenceLinks: string;
  notes: string;
};

const initialForm: BespokeForm = {
  name: '',
  phone: '',
  email: '',
  role: '',
  city: '',
  projectType: '',
  spaceType: '',
  fixtureType: '',
  quantity: '',
  roomLength: '',
  roomWidth: '',
  ceilingHeight: '',
  dropHeight: '',
  electricalPoint: '',
  style: '',
  finish: '',
  material: '',
  lightTone: '',
  budget: '',
  timeline: '',
  installationHelp: '',
  referenceLinks: '',
  notes: '',
};

const fieldClass =
  'w-full border border-[#173126]/15 bg-white/86 px-4 py-3 text-sm text-[#173126] outline-none transition placeholder:text-[#173126]/35 focus:border-[#006039]/55 focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,96,57,0.08)]';

const labelClass =
  'grid gap-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#006039]';

const selectClass = `${fieldClass} appearance-none`;

const process = [
  {
    title: 'Brief review',
    desc: 'We check dimensions, photos, ceiling height, wiring, finish direction, and budget fit.',
    Icon: Clipboard,
  },
  {
    title: 'Scale planning',
    desc: 'Recommended diameter, drop height, fixture type, material direction, and light temperature are refined.',
    Icon: Ruler,
  },
  {
    title: 'Design and quote',
    desc: 'You receive a clear direction with commercial estimate, timeline, and next information required.',
    Icon: DraftingCompass,
  },
  {
    title: 'Making support',
    desc: 'After approval, our team coordinates finishing, checks, packing, dispatch, and installation inputs.',
    Icon: Wrench,
  },
];

const requiredDetails = [
  'Room photos, ceiling photo, and nearest electrical point photo',
  'Room length, width, ceiling height, and preferred drop height',
  'Interior style, finish palette, reference images, and mood board links',
  'City, site stage, target delivery date, and budget range',
];

function buildBrief(form: BespokeForm) {
  const rows = [
    ['Name', form.name],
    ['Phone', form.phone],
    ['Email', form.email],
    ['Role', form.role],
    ['City / Site location', form.city],
    ['Project type', form.projectType],
    ['Space type', form.spaceType],
    ['Fixture type', form.fixtureType],
    ['Quantity', form.quantity],
    ['Room size', [form.roomLength, form.roomWidth].filter(Boolean).join(' x ')],
    ['Ceiling height', form.ceilingHeight],
    ['Preferred drop height', form.dropHeight],
    ['Electrical point status', form.electricalPoint],
    ['Style direction', form.style],
    ['Finish preference', form.finish],
    ['Material preference', form.material],
    ['Light tone', form.lightTone],
    ['Budget range', form.budget],
    ['Timeline', form.timeline],
    ['Installation help', form.installationHelp],
    ['Reference links', form.referenceLinks],
    ['Notes', form.notes],
  ];

  return rows
    .filter(([, value]) => value && String(value).trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

export function BespokeClient() {
  const [form, setForm] = useState<BespokeForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const brief = useMemo(() => buildBrief(form), [form]);
  const whatsappNumber = SITE_CONTACT.phone.replace(/\D/g, '');
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Royace Lighting, I want to share a bespoke lighting brief.\n\n${brief || 'I will share details shortly.'}`,
  )}`;
  const emailHref = `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(
    'Bespoke lighting brief',
  )}&body=${encodeURIComponent(brief || 'Hi Royace Lighting, I want to discuss a bespoke lighting requirement.')}`;

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
    setCopied(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const copyBrief = async () => {
    if (!brief) return;
    await navigator.clipboard.writeText(brief);
    setCopied(true);
  };

  return (
    <main className="bg-[#fffaf2] text-[#173126]">
      <section className="relative isolate overflow-hidden bg-[#12261d] px-4 pb-12 pt-28 text-white sm:px-6 lg:px-10 lg:pb-16">
        <Image
          src="/images/homepage-img/showcase1.jfif"
          alt="Bespoke chandelier planning"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover opacity-48"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,38,29,0.92),rgba(18,38,29,0.68)_48%,rgba(0,96,57,0.42))]" />

        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_430px] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#e4c77c]">
              Bespoke Lighting Studio
            </p>
            <h1 className="mt-5 text-[clamp(2.45rem,6vw,5.4rem)] font-semibold leading-[0.98]">
              Share your complete custom lighting brief in one place.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              Use this page to send room dimensions, ceiling height, style, finish, budget, timeline, reference links, and installation details for chandeliers, pendants, wall lights, and project lighting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#bespoke-form"
                className="inline-flex items-center gap-2 bg-[#e4c77c] px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#12261d] transition hover:bg-white"
              >
                Fill Project Brief <ArrowRight size={15} />
              </a>
              <Link
                href={`tel:${whatsappNumber}`}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#e4c77c] hover:text-[#e4c77c]"
              >
                Call Studio <Phone size={15} />
              </Link>
            </div>
          </div>

          <aside className="border border-white/14 bg-[#173126]/72 p-5 backdrop-blur">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#e4c77c]">
              Keep Ready
            </p>
            <div className="mt-5 grid gap-4">
              {requiredDetails.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-white/76">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#e4c77c]" />
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            id="bespoke-form"
            onSubmit={handleSubmit}
            className="border border-[#173126]/10 bg-white/90 p-5 shadow-[0_24px_80px_rgba(23,49,38,0.08)] sm:p-7 lg:p-9"
          >
            <div className="border-b border-[#173126]/10 pb-6">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#006039]">
                Project Brief Form
              </p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight">
                Tell us everything needed to plan the right piece.
              </h2>
            </div>

            {submitted && (
              <div className="mt-6 flex gap-3 border border-[#006039]/25 bg-[#006039]/8 p-4 text-sm leading-6 text-[#173126]">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#006039]" />
                Your brief is ready. Send it on WhatsApp or email from the buttons on the right.
              </div>
            )}

            <FormSection title="Client Details">
              <Input label="Name" name="name" value={form.name} onChange={updateField} required placeholder="Full name" />
              <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={updateField} required placeholder="+91 98911 19199" />
              <Input label="Email" name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" />
              <Select label="You are" name="role" value={form.role} onChange={updateField} options={['Homeowner', 'Interior Designer', 'Architect', 'Builder', 'Hotel / Hospitality', 'Retail / Commercial']} />
              <Input label="City / Site Location" name="city" value={form.city} onChange={updateField} required placeholder="Delhi, Mumbai, Jaipur..." />
              <Select label="Project Type" name="projectType" value={form.projectType} onChange={updateField} options={['Residence', 'Villa', 'Hotel', 'Restaurant', 'Office', 'Retail Store', 'Farmhouse', 'Other']} />
            </FormSection>

            <FormSection title="Space and Fixture Details">
              <Select label="Space Type" name="spaceType" value={form.spaceType} onChange={updateField} options={['Living Room', 'Dining Room', 'Foyer', 'Double Height', 'Staircase', 'Bedroom', 'Kitchen Counter', 'Lobby', 'Outdoor', 'Other']} />
              <Select label="Fixture Type" name="fixtureType" value={form.fixtureType} onChange={updateField} options={['Chandelier', 'Double Height Chandelier', 'Pendant Cluster', 'Linear Pendant', 'Wall Light', 'Ceiling Light', 'Table / Floor Lamp', 'Complete Project Package']} />
              <Input label="Quantity" name="quantity" value={form.quantity} onChange={updateField} placeholder="1 piece, 3 pendants..." />
              <Input label="Room Length" name="roomLength" value={form.roomLength} onChange={updateField} placeholder="e.g. 18 ft" />
              <Input label="Room Width" name="roomWidth" value={form.roomWidth} onChange={updateField} placeholder="e.g. 14 ft" />
              <Input label="Ceiling Height" name="ceilingHeight" value={form.ceilingHeight} onChange={updateField} placeholder="e.g. 11 ft" />
              <Input label="Preferred Drop" name="dropHeight" value={form.dropHeight} onChange={updateField} placeholder="e.g. 30 inch / flexible" />
              <Select label="Electrical Point" name="electricalPoint" value={form.electricalPoint} onChange={updateField} options={['Point already fixed', 'Point can be shifted', 'False ceiling in progress', 'Need guidance', 'Not sure']} />
            </FormSection>

            <FormSection title="Design Direction">
              <Select label="Style" name="style" value={form.style} onChange={updateField} options={['Modern Luxury', 'Classic Crystal', 'Minimal', 'Art Deco', 'Vintage', 'Contemporary', 'Indian Luxury', 'Hotel Style', 'Not Sure']} />
              <Select label="Finish" name="finish" value={form.finish} onChange={updateField} options={['Gold', 'Brass', 'Antique Brass', 'Black', 'Bronze', 'Chrome', 'Rose Gold', 'Custom Finish', 'Not Sure']} />
              <Select label="Material" name="material" value={form.material} onChange={updateField} options={['Crystal', 'Glass', 'Metal', 'Acrylic', 'Fabric Shade', 'Wood Accent', 'Mixed Material', 'Not Sure']} />
              <Select label="Light Tone" name="lightTone" value={form.lightTone} onChange={updateField} options={['Warm White 3000K', 'Neutral White 4000K', 'Dimmable', 'Three Color', 'Designer Recommendation']} />
              <Select label="Budget Range" name="budget" value={form.budget} onChange={updateField} options={['Below Rs. 50,000', 'Rs. 50,000 - Rs. 1 lakh', 'Rs. 1 lakh - Rs. 2.5 lakh', 'Rs. 2.5 lakh - Rs. 5 lakh', 'Rs. 5 lakh+', 'Need estimate']} />
              <Select label="Timeline" name="timeline" value={form.timeline} onChange={updateField} options={['Urgent', 'Within 2 weeks', 'Within 1 month', '1-2 months', 'Planning stage']} />
              <Select label="Installation Help" name="installationHelp" value={form.installationHelp} onChange={updateField} options={['Need installation support', 'Own electrician / contractor', 'Need only product', 'Need guidance']} />
              <Input label="Reference Links" name="referenceLinks" value={form.referenceLinks} onChange={updateField} placeholder="Pinterest, Drive, Instagram, product links" />
              <label className={`${labelClass} sm:col-span-2`}>
                Additional Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  className={`${fieldClass} min-h-[150px] resize-y`}
                  placeholder="Mention room mood, furniture layout, finish palette, site stage, delivery constraints, or any special requirement."
                />
              </label>
            </FormSection>

            <button
              type="submit"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-[#006039] px-6 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0b7a4d]"
            >
              Prepare My Brief
              <Send size={15} />
            </button>
          </form>

          <aside className="grid content-start gap-5 lg:sticky lg:top-24">
            <div className="border border-[#173126]/10 bg-[#173126] p-5 text-white shadow-[0_24px_80px_rgba(23,49,38,0.16)]">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#e4c77c]">
                Send Brief
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight">
                Share this directly with Royace.
              </h2>
              <div className="mt-5 grid gap-3">
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25d366] px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#092016]"
                >
                  Send on WhatsApp <MessageCircle size={15} />
                </Link>
                <Link
                  href={emailHref}
                  className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#e4c77c] hover:text-[#e4c77c]"
                >
                  Send by Email <Mail size={15} />
                </Link>
                <button
                  type="button"
                  onClick={copyBrief}
                  className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#e4c77c] hover:text-[#e4c77c]"
                >
                  {copied ? 'Copied' : 'Copy Brief'} <Clipboard size={15} />
                </button>
              </div>
            </div>

            <div className="border border-[#173126]/10 bg-white p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#006039]">
                Live Brief Preview
              </p>
              <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap bg-[#fffaf2] p-4 text-xs leading-6 text-[#173126]/70">
                {brief || 'Fill the form to generate a clean project brief here.'}
              </pre>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#173126] px-4 py-14 text-white sm:px-6 lg:px-10 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#e4c77c]">
            What Happens Next
          </p>
          <h2 className="mt-3 max-w-3xl text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-tight">
            A simple process from rough idea to site-ready lighting.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {process.map(({ title, desc, Icon }) => (
              <article key={title} className="border border-white/10 bg-white/[0.04] p-5">
                <Icon className="text-[#e4c77c]" size={26} strokeWidth={1.5} />
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-10 lg:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 border border-[#173126]/10 bg-white p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#006039]">
              Need help filling this?
            </p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-tight">
              Call or WhatsApp us and we will help complete the brief.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#173126]/62">
              Support hours: {SITE_CONTACT.supportTimings}. Phone: {SITE_CONTACT.phone}. Email: {SITE_CONTACT.email}.
            </p>
          </div>
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 bg-[#006039] px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0b7a4d]"
          >
            WhatsApp Royace <MessageCircle size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}

type InputProps = {
  label: string;
  name: keyof BespokeForm;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

function Input({ label, name, value, onChange, placeholder, type = 'text', required }: InputProps) {
  return (
    <label className={labelClass}>
      {label}
      <input
        className={fieldClass}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

type SelectProps = {
  label: string;
  name: keyof BespokeForm;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

function Select({ label, name, value, onChange, options }: SelectProps) {
  return (
    <label className={labelClass}>
      {label}
      <select className={selectClass} name={name} value={value} onChange={onChange}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="border-b border-[#173126]/10 pb-3 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#173126]">
        {title}
      </h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
