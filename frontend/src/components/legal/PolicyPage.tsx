import { SITE_CONTACT } from '@/lib/contact';

export const LEGAL_CONTACT = SITE_CONTACT;

export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'orderedList'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'subsection'; title: string; blocks: LegalBlock[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalPolicy = {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  summary: string[];
  sections: LegalSection[];
};

function renderBlock(block: LegalBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return <p className={legalTextClass} key={index}>{block.text}</p>;
    case 'list':
      return (
        <ul className={legalListClass} key={index}>
          {block.items.map((item) => (
            <li className={legalListItemClass} key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol className={legalListClass} key={index}>
          {block.items.map((item) => (
            <li className={legalListItemClass} key={item}>{item}</li>
          ))}
        </ol>
      );
    case 'note':
      return (
        <div className="mt-5 border-l-2 border-l-[var(--gold-light)] bg-[rgba(199,164,90,0.08)] px-4 py-4 text-[0.86rem] leading-[1.75] text-[rgba(250,247,240,0.82)]" key={index}>
          {block.text}
        </div>
      );
    case 'table':
      return (
        <div className="mt-5 w-full overflow-x-auto border border-[rgba(228,199,124,0.12)]" key={index}>
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th className={legalTableHeadClass} key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell) => (
                    <td className={legalTableCellClass} key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'subsection':
      return (
        <section className="mt-6 border-t border-[rgba(228,199,124,0.1)] pt-5" key={block.title}>
          <h3 className="font-sans text-[0.78rem] font-bold uppercase leading-[1.45] tracking-[0.14em] text-[var(--gold-light)]">{block.title}</h3>
          {block.blocks.map(renderBlock)}
        </section>
      );
    default:
      return null;
  }
}

export function PolicyPage({ policy }: { policy: LegalPolicy }) {
  return (
    <main className={legalPageClass}>
      <section className={legalHeroClass}>
        <div className="mx-auto w-[min(1120px,100%)]">
          <p className="luxury-kicker">Legal Information</p>
          <h1 className={legalHeroTitleClass}>{policy.title}</h1>
          <p className={legalHeroTextClass}>{policy.description}</p>
          <dl className={legalMetaClass}>
            <div className={legalMetaItemClass}>
              <dt className={legalMetaLabelClass}>Effective Date</dt>
              <dd className={legalMetaValueClass}>{policy.effectiveDate}</dd>
            </div>
            <div className={legalMetaItemClass}>
              <dt className={legalMetaLabelClass}>Last Updated</dt>
              <dd className={legalMetaValueClass}>{policy.lastUpdated}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto grid w-[min(1240px,100%)] items-start gap-[clamp(1.5rem,4vw,3rem)] px-6 py-[clamp(3rem,6vw,5rem)] pb-[clamp(5rem,8vw,7rem)] lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] max-md:px-4">
        <aside className="grid gap-4 lg:sticky lg:top-[110px]" aria-label="Policy navigation">
          <nav className={legalCardCompactClass}>
            <h2 className={legalCardHeadingClass}>On This Page</h2>
            <ol className="mt-4 grid gap-2.5 pl-4">
              {policy.sections.map((section) => (
                <li key={section.id}>
                  <a className="text-[0.74rem] leading-[1.55] text-[rgba(250,247,240,0.64)] no-underline transition-colors hover:text-[var(--gold-light)]" href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={legalCardCompactClass}>
            <h2 className={legalCardHeadingClass}>Business Details</h2>
            <p className={legalSidebarTextClass}>
              {LEGAL_CONTACT.brandName} is operated by {LEGAL_CONTACT.companyName}.
            </p>
            <address className={legalSidebarTextClass}>
              GSTIN: {LEGAL_CONTACT.gstNumber}
              <br />
              Email: {LEGAL_CONTACT.email}
              <br />
              Phone: {LEGAL_CONTACT.phone}
              <br />
              Registered Office: {LEGAL_CONTACT.registeredAddress}
              <br />
              Support Hours: {LEGAL_CONTACT.supportTimings}
            </address>
          </div>
        </aside>

        <article className="grid min-w-0 gap-4">
          <section className={legalCardClass} aria-labelledby="policy-summary">
            <h2 className={legalCardHeadingClass} id="policy-summary">Policy Overview</h2>
            <ul className={legalListClass}>
              {policy.summary.map((item) => (
                <li className={legalListItemClass} key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {policy.sections.map((section) => (
            <section className={`${legalCardClass} scroll-mt-[120px]`} id={section.id} key={section.id}>
              <h2 className="font-serif text-[clamp(1.65rem,3vw,2.35rem)] italic leading-[1.16] text-[var(--ivory)]">{section.title}</h2>
              {section.blocks.map(renderBlock)}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}

export const legalPageClass =
  'min-h-screen bg-[radial-gradient(circle_at_82%_8%,rgba(199,164,90,0.12),transparent_28%),radial-gradient(circle_at_12%_24%,rgba(0,96,57,0.2),transparent_26%),linear-gradient(180deg,var(--obsidian)_0%,var(--charcoal)_44%,var(--forest-2)_100%)] text-[var(--ivory)]';

export const legalHeroClass =
  'border-b border-[rgba(228,199,124,0.14)] px-6 py-[clamp(5.5rem,9vw,8rem)] pb-[clamp(3rem,6vw,4.8rem)] max-md:px-4 max-md:py-[4.5rem] max-md:pb-[2.7rem]';

export const legalHeroTitleClass =
  'max-w-[900px] font-serif text-[clamp(2.9rem,7vw,6.4rem)] font-normal italic leading-[1.02] text-[var(--ivory)]';

export const legalHeroTextClass =
  'mt-5 max-w-[760px] text-[clamp(0.95rem,1.45vw,1.08rem)] leading-[1.9] text-[rgba(250,247,240,0.74)]';

export const legalMetaClass = 'mt-8 flex flex-wrap gap-3 max-md:grid';

export const legalMetaItemClass =
  'min-w-[180px] border border-[rgba(228,199,124,0.18)] bg-[rgba(250,247,240,0.045)] px-4 py-3.5';

export const legalMetaLabelClass =
  'font-sans text-[0.56rem] font-bold uppercase tracking-[0.2em] text-[var(--gold-light)]';

export const legalMetaValueClass = 'mt-1.5 text-[0.82rem] leading-[1.5] text-[rgba(250,247,240,0.86)]';

export const legalCardClass =
  'border border-[rgba(228,199,124,0.16)] bg-[linear-gradient(180deg,rgba(250,247,240,0.06),rgba(250,247,240,0.025))] p-[clamp(1.35rem,3vw,2.25rem)] shadow-[0_30px_80px_rgba(0,0,0,0.25)]';

export const legalCardCompactClass =
  'border border-[rgba(228,199,124,0.16)] bg-[linear-gradient(180deg,rgba(250,247,240,0.06),rgba(250,247,240,0.025))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.25)]';

export const legalCardHeadingClass =
  'font-sans text-[0.62rem] font-bold uppercase leading-[1.4] tracking-[0.2em] text-[var(--gold-light)]';

const legalSidebarTextClass =
  'mt-3.5 text-[0.76rem] not-italic leading-[1.8] text-[rgba(250,247,240,0.66)]';

const legalListClass = 'mt-4 grid gap-3 pl-5';

const legalListItemClass = 'text-[0.88rem] leading-[1.78] text-[rgba(250,247,240,0.72)]';

const legalTextClass = 'mt-4 text-[0.9rem] leading-[1.9] text-[rgba(250,247,240,0.72)]';

const legalTableHeadClass =
  'border-b border-[rgba(228,199,124,0.1)] bg-[rgba(0,96,57,0.18)] px-4 py-4 text-left align-top text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[var(--gold-light)]';

const legalTableCellClass =
  'border-b border-[rgba(228,199,124,0.1)] px-4 py-4 text-left align-top text-[0.82rem] leading-[1.65] text-[rgba(250,247,240,0.7)]';
