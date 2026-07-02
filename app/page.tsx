import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleHelp,
  ClipboardList,
  FileText,
  ImageIcon,
  Layers,
  MonitorSmartphone,
  QrCode,
  Store,
  Smartphone,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Catalogues for Modern Showrooms",
  description:
    "Turn your showroom into a digital catalogue experience for windows, railings, interiors, and architectural materials.",
};

const painPoints: IconListItem[] = [
  { Icon: FileText, title: "Static PDF catalogues" },
  { Icon: ImageIcon, title: "Endless WhatsApp images" },
  { Icon: Users, title: "Family discussions across screenshots" },
  { Icon: Store, title: "Multiple showroom visits" },
  { Icon: CircleHelp, title: "Uncertainty after selection" },
];

const howItWorks: IconListItem[] = [
  {
    Icon: Upload,
    title: "Upload Your Products",
    body: "Add your product images, materials, finishes, categories, and specifications. Vizora organizes your catalogue.",
  },
  {
    Icon: QrCode,
    title: "Share With Customers",
    body: "Generate a simple link or QR code. Customers can explore products during or after visiting your showroom.",
  },
  {
    Icon: BookOpenCheck,
    title: "Help Them Decide Faster",
    body: "Customers can compare options, shortlist designs, revisit choices, and discuss with family.",
  },
];

const customerActions = [
  "compare options",
  "shortlist designs",
  "revisit choices",
  "discuss with family",
];

const benefits = [
  "Present products professionally",
  "Reduce repeated follow-ups",
  "Give customers confidence",
  "Keep customer choices organized",
  "Understand what customers are interested in",
];

const builtFor = [
  "Windows",
  "Railings",
  "Glass Works",
  "Interior Materials",
  "Custom Manufacturing",
];

type IconListItem = {
  Icon: LucideIcon;
  title: string;
  body?: string;
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas pt-[74px] text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-surface-soft/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="Vizora home">
            <span className="grid h-10 w-10 place-items-center bg-ink font-serif text-base font-semibold text-on-primary">
              V
            </span>
            <span className="leading-none">
              <span className="block text-base font-semibold">Vizora</span>
              <span className="block text-[11px] text-muted">
                Digital showrooms
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] font-semibold text-body md:flex">
            <a className="transition-colors hover:text-ink" href="#how-it-works">
              How it works
            </a>
            <a className="transition-colors hover:text-ink" href="#built-for">
              Built for
            </a>
          </nav>
          <Link
            href="/catalog/create-catalog"
            className="inline-flex h-11 items-center justify-center gap-2 border border-ink bg-ink px-4 text-[13px] font-semibold text-on-primary transition-colors hover:border-m-blue-dark hover:bg-m-blue-dark"
          >
            Start
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="vizora-stripe h-0.5" />
      </header>

      <section className="border-b border-hairline bg-surface-soft">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:min-h-[560px] lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
          <div className="max-w-2xl">
            <p className="uppercase-label mb-4 text-muted">Vizora</p>
            <h1 className="editorial-title text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Digital catalogues for showroom sales
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-body sm:text-lg sm:leading-8">
              Turn product photos into a clean, shareable catalogue customers can
              browse, shortlist, and revisit.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalog/create-catalog"
                className="inline-flex h-12 items-center justify-center gap-2 border border-m-blue-dark bg-m-blue-dark px-6 text-sm font-semibold text-on-primary transition-colors hover:border-m-red hover:bg-m-red"
              >
                Create catalogue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center border border-hairline-strong bg-surface-soft px-6 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                See how it works
              </a>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden border border-hairline bg-surface-card sm:min-h-[420px] lg:min-h-[480px]">
            <Image
              src="/vizora-showroom-catalogue.png"
              alt="A bright showroom catalogue interface for windows, railings, and material products"
              fill
              preload
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section id="problem" className="bg-surface-soft">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <SectionHeader
            eyebrow="Problem"
            title="Selling designs is still stuck in the past"
            body="Customers don't buy because they saw a product. They buy when they feel confident about the decision."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {painPoints.map((item) => (
              <IconCard key={item.title} item={item} />
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-body-strong">
            High-value design decisions need a better experience.
          </p>
        </div>
      </section>

      <section className="border-y border-hairline bg-canvas">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <SectionHeader
            eyebrow="Solution"
            title="Meet Vizora"
            body="A digital showroom layer for physical businesses. Create beautiful product collections your customers can explore from their phones."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <MessagePanel
              label="Instead of"
              text="Let me send you some options"
            />
            <MessagePanel
              label="Give them"
              text="Here is your personalized showroom experience."
              highlighted
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-surface-soft">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <SectionHeader
            eyebrow="How it works"
            title="From upload to confident customer decisions"
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {howItWorks.map((item, index) => (
              <ProcessCard key={item.title} item={item} step={index + 1} />
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {customerActions.map((action) => (
              <div
                key={action}
                className="flex items-center gap-3 border border-hairline bg-canvas p-4"
              >
                <Check className="h-5 w-5 text-success" aria-hidden="true" />
                <span className="text-sm font-semibold text-body-strong">
                  {action}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xl font-semibold text-ink">
            Less confusion. Better decisions.
          </p>
        </div>
      </section>

      <section className="border-y border-hairline bg-canvas">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:items-center">
          <SectionHeader
            eyebrow="Product demo"
            title="Your catalogue, upgraded"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FlowPanel
              label="Before"
              items={["PDF", "WhatsApp", "Screenshots", "Confusion"]}
            />
            <FlowPanel
              label="After"
              items={[
                "Showroom",
                "Digital Session",
                "Collaboration",
                "Final Decision",
              ]}
              highlighted
            />
          </div>
        </div>
      </section>

      <section className="bg-surface-soft">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <SectionHeader
            eyebrow="Vendor benefits"
            title="More than a catalogue"
            body="Vizora helps businesses present clearly, follow up with less friction, and keep every customer decision organized."
          />
          <div className="grid gap-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 border border-hairline bg-canvas p-4"
              >
                <Check className="mt-0.5 h-5 w-5 text-success" aria-hidden="true" />
                <span className="text-[15px] font-semibold leading-6 text-body-strong">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="built-for" className="border-y border-hairline bg-canvas">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <SectionHeader
            eyebrow="Built for"
            title="Fabrication Businesses"
            body="Where every customer decision matters."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {builtFor.map((item) => (
              <div
                key={item}
                className="border border-hairline bg-surface-soft p-5"
              >
                <Layers className="mb-5 h-5 w-5 text-m-blue-dark" aria-hidden="true" />
                <p className="text-base font-semibold text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-on-primary">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:px-10 lg:items-center">
          <div>
            <p className="uppercase-label mb-4 text-white/58">
              Premium positioning
            </p>
            <h2 className="editorial-title max-w-4xl text-4xl leading-[1.08] sm:text-5xl">
              Your products deserve more than a PDF
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/72 sm:text-base">
              Your customers are making decisions about their homes. Give them
              an experience that matches the importance of that decision.
            </p>
          </div>
          <div className="grid gap-3 border border-white/12 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3 border border-white/12 bg-white/[0.06] p-4">
              <MonitorSmartphone className="h-5 w-5 text-white" aria-hidden="true" />
              <span className="text-sm font-semibold text-white/84">
                Mobile-first product exploration
              </span>
            </div>
            <div className="flex items-center gap-3 border border-white/12 bg-white/[0.06] p-4">
              <ClipboardList className="h-5 w-5 text-white" aria-hidden="true" />
              <span className="text-sm font-semibold text-white/84">
                Organized customer choices
              </span>
            </div>
            <div className="flex items-center gap-3 border border-white/12 bg-white/[0.06] p-4">
              <Smartphone className="h-5 w-5 text-white" aria-hidden="true" />
              <span className="text-sm font-semibold text-white/84">
                Shareable showroom sessions
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-soft">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="uppercase-label mb-4 text-muted">CTA</p>
            <h2 className="editorial-title max-w-3xl text-4xl leading-[1.08] sm:text-5xl">
              Create your first digital showroom
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-body sm:text-base">
              Get your product catalogue transformed into an interactive
              experience.
            </p>
          </div>
          <Link
            href="/catalog/create-catalog"
            className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-[4px] border border-m-blue-dark bg-m-blue-dark px-6 text-sm font-semibold text-on-primary transition-colors hover:border-m-red hover:bg-m-red"
          >
            Start Your Catalogue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-hairline bg-canvas">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-8 text-sm text-body sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p className="text-base font-semibold text-ink">Vizora</p>
          <p>Interactive catalogues for modern showrooms.</p>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div>
      <p className="uppercase-label mb-4 text-muted">{eyebrow}</p>
      <h2 className="editorial-title max-w-4xl text-4xl leading-[1.08] sm:text-5xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-body sm:text-base">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function IconCard({ item }: { item: IconListItem }) {
  const Icon = item.Icon;

  return (
    <div className="border border-hairline bg-canvas p-5">
      <Icon className="mb-6 h-5 w-5 text-m-blue-dark" aria-hidden="true" />
      <p className="text-[15px] font-semibold leading-6 text-body-strong">
        {item.title}
      </p>
      {item.body ? (
        <p className="mt-3 text-sm leading-6 text-body">{item.body}</p>
      ) : null}
    </div>
  );
}

function ProcessCard({ item, step }: { item: IconListItem; step: number }) {
  const Icon = item.Icon;

  return (
    <article className="border border-hairline bg-canvas p-6">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">
          {String(step).padStart(2, "0")}
        </span>
        <Icon className="h-5 w-5 text-m-blue-dark" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold leading-tight text-ink">{item.title}</h3>
      <p className="mt-4 text-sm leading-6 text-body">{item.body}</p>
    </article>
  );
}

function MessagePanel({
  label,
  text,
  highlighted = false,
}: {
  label: string;
  text: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? "border border-m-blue-dark bg-m-blue-dark p-6 text-on-primary"
          : "border border-hairline bg-surface-soft p-6 text-ink"
      }
    >
      <p
        className={
          highlighted
            ? "uppercase-label mb-4 text-white/70"
            : "uppercase-label mb-4 text-muted"
        }
      >
        {label}
      </p>
      <p className="editorial-title text-3xl leading-tight">
        &quot;{text}&quot;
      </p>
    </div>
  );
}

function FlowPanel({
  label,
  items,
  highlighted = false,
}: {
  label: string;
  items: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? "border border-ink bg-ink p-6 text-on-primary"
          : "border border-hairline bg-surface-soft p-6"
      }
    >
      <p
        className={
          highlighted
            ? "uppercase-label mb-5 text-white/60"
            : "uppercase-label mb-5 text-muted"
        }
      >
        {label}
      </p>
      <ol className="grid gap-3">
        {items.map((item, index) => (
          <li key={item} className="flex items-center gap-3">
            <span
              className={
                highlighted
                  ? "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white"
                  : "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-elevated text-xs font-semibold text-muted"
              }
            >
              {index + 1}
            </span>
            <span
              className={
                highlighted
                  ? "text-[15px] font-semibold text-white/88"
                  : "text-[15px] font-semibold text-body-strong"
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
