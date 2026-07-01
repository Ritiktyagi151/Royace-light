import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Clock, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { ContactUsClient } from '@/components/contact/ContactUsClient';
import {
  LEGAL_CONTACT,
  legalCardClass,
  legalHeroClass,
  legalHeroTextClass,
  legalHeroTitleClass,
  legalMetaClass,
  legalMetaItemClass,
  legalMetaLabelClass,
  legalMetaValueClass,
  legalPageClass,
} from '@/components/legal/PolicyPage';
import { mailTo } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contact Us | Royace Lighting',
  description:
    'Contact Royace Lighting for luxury chandeliers, pendant lights, decorative lighting orders, custom lighting consultations, shipping support, returns, refunds, and warranty assistance.',
};

const contactCards = [
  {
    title: 'Customer Support',
    detail: LEGAL_CONTACT.email,
    helper: 'Order updates, payment queries, returns, refunds, and warranty support.',
    href: mailTo('Royace Lighting customer support enquiry'),
    Icon: Mail,
  },
  {
    title: 'Phone Support',
    detail: LEGAL_CONTACT.phone,
    helper: 'For urgent delivery, damage reporting, and custom project coordination.',
    href: LEGAL_CONTACT.phoneHref,
    Icon: Phone,
  },
  {
    title: 'Registered Office',
    detail: LEGAL_CONTACT.registeredAddress,
    helper: `GSTIN: ${LEGAL_CONTACT.gstNumber}`,
    href: LEGAL_CONTACT.mapUrl,
    Icon: MapPin,
  },
  {
    title: 'Business Hours',
    detail: LEGAL_CONTACT.supportTimings,
    helper: 'Responses may be slower on Sundays, public holidays, and peak festive periods.',
    href: mailTo('Royace Lighting appointment request'),
    Icon: Clock,
  },
];

const faqs = [
  {
    question: 'How quickly will Royace Lighting respond to my enquiry?',
    answer:
      'We aim to respond during stated support timings. Order, payment, shipping, and damaged-product queries are prioritised when you include your order ID, registered phone number, invoice copy, and photographs where relevant.',
  },
  {
    question: 'What details should I share for a custom chandelier or pendant light?',
    answer:
      'Please share room type, ceiling height, preferred size, finish, colour temperature, installation city, reference images, budget range, project timeline, and any drawings or site photographs available. Our team may request additional details before confirming feasibility, price, and timeline.',
  },
  {
    question: 'Can I contact support for payment gateway or failed payment issues?',
    answer:
      'Yes. Please share the order ID, payment reference, transaction screenshot if available, payment date, payment mode, and registered mobile number. Failed or duplicate payments are verified through gateway settlement reports before refund initiation.',
  },
  {
    question: 'How do I report a damaged, wrong, or missing product?',
    answer:
      'Contact us within 48 hours of delivery with order ID, invoice copy, outer packaging photographs, inner packaging photographs, product photographs, and a continuous unboxing video wherever possible. Do not install or discard packaging until our team has reviewed the claim.',
  },
  {
    question: 'Does Royace Lighting provide installation?',
    answer:
      'Installation is available only where expressly mentioned in writing and may depend on city serviceability, product type, site access, ceiling readiness, electrical readiness, and appointment availability. Product prices do not automatically include installation.',
  },
  {
    question: 'Can I visit the showroom or office?',
    answer:
      'Visits, showroom appointments, trade consultations, and project meetings may be available by prior appointment at the address or location confirmed by our team. Please contact support before visiting.',
  },
];

export default function ContactUsPage() {
  return <ContactUsClient />;

  return (
    <main className={legalPageClass}>
      <section className={legalHeroClass}>
        <div className="mx-auto w-[min(1120px,100%)]">
          <p className="luxury-kicker">Contact Us</p>
          <h1 className={legalHeroTitleClass}>Contact Royace Lighting</h1>
          <p className={legalHeroTextClass}>
            Speak with our team for decorative lighting orders, luxury chandeliers,
            pendant lights, made-to-order commissions, payment support, delivery
            updates, returns, refunds, and warranty assistance.
          </p>
          <dl className={legalMetaClass}>
            <div className={legalMetaItemClass}>
              <dt className={legalMetaLabelClass}>Company</dt>
              <dd className={legalMetaValueClass}>{LEGAL_CONTACT.companyName}</dd>
            </div>
            <div className={legalMetaItemClass}>
              <dt className={legalMetaLabelClass}>GSTIN</dt>
              <dd className={legalMetaValueClass}>{LEGAL_CONTACT.gstNumber}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto grid w-[min(1240px,100%)] items-start gap-[clamp(1.5rem,4vw,3rem)] px-6 py-[clamp(3rem,6vw,5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,430px)] max-md:px-4" aria-labelledby="company-details">
        <div className="contact-details">
          <div className="section-heading section-heading-left">
            <p className="luxury-kicker">Support Desk</p>
            <h2 id="company-details">Company Details and Customer Support</h2>
            <p>
              Use the details below for order support, payment verification,
              product consultation, custom lighting enquiries, and post-delivery
              assistance. Please include your order ID wherever applicable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {contactCards.map(({ title, detail, helper, href, Icon }) => (
              <article className={`${legalCardClass} min-h-[210px] p-5 max-md:min-h-0`} key={title}>
                <Icon size={20} strokeWidth={1.5} className="text-[var(--gold-light)]" />
                <h3 className="mt-4 font-sans text-[0.76rem] font-bold uppercase leading-[1.45] tracking-[0.16em] text-[var(--ivory)]">{title}</h3>
                <Link className="mt-3 inline-block text-[0.88rem] leading-[1.55] text-[rgba(250,247,240,0.88)] no-underline transition-colors hover:text-[var(--gold-light)]" href={href}>
                  {detail}
                </Link>
                <p className={contactMutedClass}>{helper}</p>
              </article>
            ))}
          </div>

          <div className={`${legalCardClass} mt-4 grid min-h-[320px] place-items-center bg-[linear-gradient(135deg,rgba(6,47,36,0.72),rgba(16,11,7,0.86)),repeating-linear-gradient(45deg,rgba(228,199,124,0.04)_0,rgba(228,199,124,0.04)_1px,transparent_1px,transparent_18px)] p-8 text-center max-md:min-h-[260px]`} role="region" aria-label="Royace Lighting location">
            <div>
              <MapPin size={30} strokeWidth={1.4} className="text-[var(--gold-light)]" />
            </div>
            <h2 className="font-serif text-[clamp(1.45rem,2.6vw,2rem)] italic text-[var(--ivory)]">Visit by Appointment</h2>
            <p className={contactMutedClass}>
              Our team can help schedule showroom visits, project meetings, and
              trade consultations at the confirmed Royace Lighting location.
            </p>
            <Link
              className="rl-button rl-button-outline mt-5 inline-flex items-center gap-2"
              href={LEGAL_CONTACT.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              Get Directions
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <aside className={`${legalCardClass} p-[clamp(1.35rem,3vw,2rem)] lg:sticky lg:top-[110px]`} aria-labelledby="inquiry-form">
          <div className="flex items-center gap-4 border-b border-[rgba(228,199,124,0.12)] pb-4">
            <MessageSquare size={22} strokeWidth={1.4} className="text-[var(--gold-light)]" />
            <div>
              <p className="overline-text">Inquiry Form</p>
              <h2 className="mt-1 font-serif text-[clamp(1.45rem,2.4vw,2rem)] italic text-[var(--ivory)]" id="inquiry-form">Send Us a Message</h2>
            </div>
          </div>

          <form
            className="mt-5 grid grid-cols-2 gap-4 max-md:grid-cols-1 [&_button]:col-span-full [&_button]:w-full [&_input]:w-full [&_input]:border [&_input]:border-[rgba(228,199,124,0.18)] [&_input]:bg-[rgba(5,4,3,0.54)] [&_input]:px-4 [&_input]:py-3.5 [&_input]:text-[0.82rem] [&_input]:tracking-[0.02em] [&_input]:text-[var(--ivory)] [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-[rgba(250,247,240,0.32)] [&_input:focus]:border-[rgba(228,199,124,0.52)] [&_input:focus]:bg-[rgba(0,96,57,0.16)] [&_input:focus]:shadow-[0_0_0_3px_rgba(199,164,90,0.08)] [&_label]:grid [&_label]:gap-2 [&_label]:font-sans [&_label]:text-[0.58rem] [&_label]:font-bold [&_label]:uppercase [&_label]:leading-[1.4] [&_label]:tracking-[0.16em] [&_label]:text-[var(--gold-light)] [&_select]:w-full [&_select]:border [&_select]:border-[rgba(228,199,124,0.18)] [&_select]:bg-[rgba(5,4,3,0.54)] [&_select]:px-4 [&_select]:py-3.5 [&_select]:text-[0.82rem] [&_select]:tracking-[0.02em] [&_select]:text-[var(--ivory)] [&_select]:outline-none [&_select:focus]:border-[rgba(228,199,124,0.52)] [&_select:focus]:bg-[rgba(0,96,57,0.16)] [&_select:focus]:shadow-[0_0_0_3px_rgba(199,164,90,0.08)] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:border [&_textarea]:border-[rgba(228,199,124,0.18)] [&_textarea]:bg-[rgba(5,4,3,0.54)] [&_textarea]:px-4 [&_textarea]:py-3.5 [&_textarea]:text-[0.82rem] [&_textarea]:tracking-[0.02em] [&_textarea]:text-[var(--ivory)] [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:placeholder:text-[rgba(250,247,240,0.32)] [&_textarea:focus]:border-[rgba(228,199,124,0.52)] [&_textarea:focus]:bg-[rgba(0,96,57,0.16)] [&_textarea:focus]:shadow-[0_0_0_3px_rgba(199,164,90,0.08)]"
            action={mailTo('Royace Lighting website enquiry')}
            method="post"
            encType="text/plain"
          >
            <label>
              Full Name
              <input name="fullName" type="text" placeholder="Enter your full name" required />
            </label>
            <label>
              Email Address
              <input name="email" type="email" placeholder="Enter your email address" required />
            </label>
            <label>
              Phone Number
              <input name="phone" type="tel" placeholder="Enter your phone number" required />
            </label>
            <label>
              Order ID
              <input name="orderId" type="text" placeholder="Optional, if your enquiry relates to an order" />
            </label>
            <label>
              Inquiry Type
              <select name="inquiryType" required defaultValue="">
                <option value="" disabled>
                  Select an inquiry type
                </option>
                <option value="product-consultation">Product consultation</option>
                <option value="custom-lighting">Custom or made-to-order lighting</option>
                <option value="order-support">Order support</option>
                <option value="payment-invoice">Payment or GST invoice query</option>
                <option value="shipping-delivery">Shipping or delivery support</option>
                <option value="returns-refunds">Returns, refunds, or cancellation</option>
                <option value="damaged-product">Damaged, wrong, or missing product</option>
                <option value="trade-designer">Trade, architect, or designer enquiry</option>
              </select>
            </label>
            <label>
              Product or Project Details
              <input
                name="productOrProject"
                type="text"
                placeholder="Example: chandelier for dining room, pendant light, order item"
              />
            </label>
            <label className="col-span-full">
              Message
              <textarea
                name="message"
                rows={6}
                placeholder="Tell us how we can help. For custom lighting, include dimensions, finish preference, city, timeline, and budget range."
                required
              />
            </label>
            <p className="col-span-full mt-3 text-[0.8rem] leading-[1.75] text-[rgba(250,247,240,0.64)]">
              For damaged products, please email photographs, packaging images,
              invoice copy, and unboxing video to {LEGAL_CONTACT.email} along
              with your order ID.
            </p>
            <button type="submit" className="rl-button rl-button-primary">
              Submit Inquiry
            </button>
          </form>
        </aside>
      </section>

      <section className="mx-auto w-[min(1240px,100%)] px-6 pb-[clamp(5rem,8vw,7rem)] max-md:px-4" aria-labelledby="contact-faqs">
        <div className="section-heading">
          <p className="luxury-kicker">Help Centre</p>
          <h2 id="contact-faqs">Contact Us FAQs</h2>
          <p>
            Quick answers for common customer support, custom lighting, payment,
            delivery, and damaged-product questions.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {faqs.map((faq) => (
            <article className={`${legalCardClass} min-h-[250px] p-5 max-md:min-h-0`} key={faq.question}>
              <h3 className="mt-4 font-sans text-[0.76rem] font-bold uppercase leading-[1.45] tracking-[0.16em] text-[var(--ivory)]">{faq.question}</h3>
              <p className={contactMutedClass}>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const contactMutedClass = 'mt-3 text-[0.8rem] leading-[1.75] text-[rgba(250,247,240,0.64)]';
