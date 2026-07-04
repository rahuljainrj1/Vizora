import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Clock3,
  Check,
  ClipboardList,
  Heart,
  Layers,
  MonitorSmartphone,
  PlayCircle,
  QrCode,
  ShieldCheck,
  Store,
  Smartphone,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Catalogues for Modern Showrooms",
  description:
    "Turn product photos into a shareable link customers can browse, compare, and revisit without the WhatsApp chaos.",
};

const workflowSteps: WorkflowStep[] = [
  {
    Icon: Upload,
    eyebrow: "2 min setup",
    title: "Upload showroom products",
    body: "Add product images, finish details, categories, and basic specifications once.",
    status: "Catalogue base ready",
    previewTitle: "Product intake",
    previewItems: ["Images", "SKU", "Material", "Finish"],
  },
  {
    Icon: BookOpenCheck,
    eyebrow: "Guided curation",
    title: "Build a customer selection",
    body: "Pick the exact SKUs for one buyer instead of sharing the full library.",
    status: "Selection prepared",
    previewTitle: "Curated set",
    previewItems: ["Window", "Railing", "Panel"],
  },
  {
    Icon: QrCode,
    eyebrow: "1-click share",
    title: "Send a private link",
    body: "Share the catalogue by WhatsApp or QR code while the visit is still fresh.",
    status: "Ready for WhatsApp",
    previewTitle: "Share link",
    previewItems: ["WhatsApp", "QR", "Copy link"],
  },
  {
    Icon: Heart,
    eyebrow: "Live shortlist",
    title: "Customer compares and saves",
    body: "Buyers shortlist options, compare finishes, and revisit choices with family.",
    status: "Buying signal captured",
    previewTitle: "Customer actions",
    previewItems: ["Viewed", "Shortlisted", "Compared"],
  },
  {
    Icon: ClipboardList,
    eyebrow: "Sales follow-up",
    title: "Quote with context",
    body: "Your team follows up with the products, notes, and preferences already organized.",
    status: "Quote-ready",
    previewTitle: "Next action",
    previewItems: ["Call buyer", "Share quote", "Close loop"],
  },
];

const demoProducts = [
  {
    name: "Slimline Black Window",
    sku: "WIN-044",
    finish: "Matte black",
    note: "Shortlisted",
    active: true,
  },
  {
    name: "Bronze Balcony Railing",
    sku: "RAIL-012",
    finish: "Muted bronze",
    note: "Compare",
    active: true,
  },
  {
    name: "Walnut Wall Panel",
    sku: "LAM-203",
    finish: "Open grain",
    note: "Viewed",
    active: false,
  },
];

const benefits = [
  "Present products professionally",
  "Reduce repeated follow-ups",
  "Give customers confidence",
  "Keep customer choices organized",
  "Understand what customers are interested in",
];

const trustSignals: IconListItem[] = [
  {
    Icon: Store,
    title: "Built for Indian SMEs",
    body: "Made for fabrication, interiors, windows, railings, and material showrooms.",
  },
  {
    Icon: ShieldCheck,
    title: "Private customer links",
    body: "Share only the catalogue session you create for that buyer.",
  },
  {
    Icon: Clock3,
    title: "No credit card for demo",
    body: "Start with a sample catalogue before committing your team.",
  },
];

const builtForDetails = [
  {
    title: "Windows and facade systems",
    fit: "Best for made-to-measure SKUs",
    body: "Compare frame finish, glass type, module size, and lead time without losing the buyer in a PDF.",
    tags: ["Windows", "Facades", "Glass"],
  },
  {
    title: "Railings and metal fabrication",
    fit: "Best for visual approvals",
    body: "Show railing profiles, finishes, installation notes, and alternates in one customer-ready session.",
    tags: ["Railings", "Staircases", "Balconies"],
  },
  {
    title: "Interior materials dealers",
    fit: "Best for family shortlists",
    body: "Help buyers revisit laminates, panels, tiles, and hardware options after the showroom visit.",
    tags: ["Laminates", "Panels", "Tiles"],
  },
  {
    title: "Custom manufacturing teams",
    fit: "Best for quote handoff",
    body: "Keep product context, customer preferences, and quote-ready notes together for the sales team.",
    tags: ["Custom sizes", "Notes", "Quotes"],
  },
];

type IconListItem = {
  Icon: LucideIcon;
  title: string;
  body?: string;
};

type WorkflowStep = {
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  status: string;
  previewTitle: string;
  previewItems: string[];
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
            <a className="transition-colors hover:text-ink" href="#demo">
              Demo
            </a>
            <a className="transition-colors hover:text-ink" href="#how-it-works">
              How it works
            </a>
            <a className="transition-colors hover:text-ink" href="#honesty">
              Early access
            </a>
          </nav>
          <Link
            href="/catalog/create-catalog"
            className="inline-flex h-11 items-center justify-center gap-2 border border-ink bg-ink px-4 text-[13px] font-semibold text-on-primary transition-colors hover:border-m-blue-dark hover:bg-m-blue-dark"
          >
            Join first 10
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
              Digital catalogues for showroom sales.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-body sm:text-lg sm:leading-8">
              Turn product photos into a shareable link customers can browse,
              compare, and revisit — without the WhatsApp chaos.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalog/create-catalog"
                className="inline-flex h-12 items-center justify-center gap-2 border border-m-blue-dark bg-m-blue-dark px-6 text-sm font-semibold text-on-primary transition-colors hover:border-m-red hover:bg-m-red"
              >
                Join the first 10 vendors
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#demo"
                className="inline-flex h-12 items-center justify-center gap-2 border border-hairline-strong bg-surface-soft px-6 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                Watch 45-sec demo
              </a>
            </div>
            <div className="mt-6 grid gap-3 border-y border-hairline py-4 text-sm text-body sm:grid-cols-3">
              <span className="font-semibold text-body-strong">
                Early access
              </span>
              <span>No credit card</span>
              <span>Built with first vendors</span>
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

      <section id="problem" className="scroll-mt-[74px] bg-surface-soft">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:items-start">
          <div>
            <p className="uppercase-label mb-4 text-muted">Problem</p>
            <h2 className="editorial-title max-w-3xl text-4xl leading-[1.08] sm:text-5xl">
              You already know this feeling.
            </h2>
          </div>
          <div className="border border-hairline bg-canvas p-6 sm:p-8">
            <div className="grid gap-5 text-[15px] leading-7 text-body sm:text-base sm:leading-8">
              <p>
                A customer spends an hour in your showroom. They&apos;re interested.
                They leave to &quot;discuss with family.&quot; You send photos. They
                send screenshots. Someone sees a different shade on their phone.
                The thread dies. The sale doesn&apos;t close.
              </p>
              <p className="font-semibold text-body-strong">
                Nothing went wrong. The workflow just wasn&apos;t built for this
                kind of decision.
              </p>
            </div>
          </div>
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

      <section id="how-it-works" className="scroll-mt-[74px] bg-surface-soft">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeader
              eyebrow="For showroom teams · How it works"
              title="A five-step sales flow from product upload to quote-ready follow-up"
              body="Each step gives the sales team a clear action, visible status, and customer decision surface."
            />
            <div className="border border-hairline bg-canvas p-5">
              <p className="uppercase-label text-muted">Workflow summary</p>
              <div className="mt-4 grid gap-px bg-hairline sm:grid-cols-3">
                <div className="bg-surface-soft p-4">
                  <p className="text-3xl font-semibold text-ink">01</p>
                  <p className="mt-2 text-sm text-body">Catalogue setup</p>
                </div>
                <div className="bg-surface-soft p-4">
                  <p className="text-3xl font-semibold text-ink">02</p>
                  <p className="mt-2 text-sm text-body">Customer session</p>
                </div>
                <div className="bg-surface-soft p-4">
                  <p className="text-3xl font-semibold text-ink">03</p>
                  <p className="mt-2 text-sm text-body">Quote follow-up</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-4">
            {workflowSteps.map((step, index) => (
              <WorkflowStepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="scroll-mt-[74px] border-y border-hairline bg-canvas">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:px-10 lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Demo"
              title="Show compare and shortlist in one link"
              body="A showroom-ready session gives customers the exact options, notes, and comparison view they need after the visit."
            />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#sample-catalog"
                className="inline-flex h-12 items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-semibold text-on-primary transition-colors hover:border-m-blue-dark hover:bg-m-blue-dark"
              >
                Get sample catalog in 60 seconds
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <DemoPreview />
        </div>
      </section>

      <section id="honesty" className="scroll-mt-[74px] bg-surface-soft">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
          <div>
            <p className="uppercase-label mb-4 text-muted">Honesty section</p>
            <h2 className="editorial-title max-w-3xl text-4xl leading-[1.08] sm:text-5xl">
              Why we built this — and where we actually are
            </h2>
          </div>
          <div className="grid gap-4">
            <article className="border border-hairline bg-canvas p-6 sm:p-8">
              <div className="grid gap-5 text-[15px] leading-7 text-body sm:text-base sm:leading-8">
                <p>
                  This started with a friend who runs a window fabrication business.
                  He was losing post-visit sales to WhatsApp confusion and asked if
                  there was a better way to share his catalogue.
                </p>
                <p>
                  Then we remembered our own experience — selecting a laminate,
                  photographing it, sending it to family, and watching the color
                  look completely wrong on their screen. The purchase still
                  happened. But the confidence never arrived.
                </p>
                <p className="font-semibold text-body-strong">
                  We&apos;re building the tool we both needed.
                </p>
              </div>
            </article>
            <article className="border border-ink bg-ink p-6 text-on-primary sm:p-8">
              <p className="uppercase-label text-white/58">Early access</p>
              <p className="mt-5 text-[15px] leading-7 text-white/78 sm:text-base sm:leading-8">
                Vizora is in early access. We don&apos;t have a hundred customers.
                We have a working product, a real problem, and we&apos;re looking
                for ten fabrication and interior vendors who want to be the first
                batch — and help us build this right.
              </p>
              <p className="mt-6 text-xl font-semibold text-white">
                If that&apos;s you, we want to talk.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-canvas">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
          <div className="grid gap-3 lg:grid-cols-3">
            {trustSignals.map((item) => (
              <IconCard key={item.title} item={item} />
            ))}
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

      <section id="built-for" className="scroll-mt-[74px] border-y border-hairline bg-canvas">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeader
              eyebrow="Built for"
              title="Indian showroom categories where visual decisions take time"
              body="For businesses where customers need to compare finishes, review choices with family, and return with quote-ready preferences."
            />
            <div className="border border-hairline bg-surface-soft p-5">
              <p className="uppercase-label text-muted">Common workflow</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-body-strong">
                <span className="border border-hairline bg-canvas px-3 py-2">
                  Show options
                </span>
                <span className="border border-hairline bg-canvas px-3 py-2">
                  Shortlist with family
                </span>
                <span className="border border-hairline bg-canvas px-3 py-2">
                  Quote selected SKUs
                </span>
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {builtForDetails.map((item) => (
              <BuiltForCard key={item.title} item={item} />
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

      <section id="sample-catalog" className="scroll-mt-[74px] bg-surface-soft">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="uppercase-label mb-4 text-muted">CTA</p>
            <h2 className="editorial-title max-w-3xl text-4xl leading-[1.08] sm:text-5xl">
              Join the first 10 vendors.
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-body sm:text-base">
              No credit card. No pitch call. Just send us one WhatsApp thread from
              a recent customer follow-up and we&apos;ll show you what it looks like
              as a Vizora session.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalog/create-catalog"
              className="inline-flex h-12 w-fit items-center justify-center gap-2 border border-m-blue-dark bg-m-blue-dark px-6 text-sm font-semibold text-on-primary transition-colors hover:border-m-red hover:bg-m-red"
            >
              Join the first 10 vendors
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#demo"
              className="inline-flex h-12 w-fit items-center justify-center gap-2 border border-hairline-strong bg-surface-soft px-6 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Watch demo
            </a>
          </div>
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

function WorkflowStepCard({
  step,
  index,
}: {
  step: WorkflowStep;
  index: number;
}) {
  const Icon = step.Icon;

  return (
    <article className="grid gap-px border border-hairline bg-hairline lg:grid-cols-[0.78fr_1.22fr]">
      <div className="bg-canvas p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Icon className="h-5 w-5 text-m-blue-dark" aria-hidden="true" />
        </div>
        <p className="uppercase-label mt-8 text-muted">{step.eyebrow}</p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight text-ink">
          {step.title}
        </h3>
        <p className="mt-4 text-sm leading-6 text-body">{step.body}</p>
        <p className="mt-6 border border-hairline bg-surface-soft px-3 py-2 text-xs font-semibold text-body-strong">
          {step.status}
        </p>
      </div>
      <div className="bg-surface-soft p-5 sm:p-6">
        <div className="border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
            <p className="uppercase-label text-muted">{step.previewTitle}</p>
            <span className="h-2 w-2 bg-m-blue-dark" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {step.previewItems.map((item) => (
              <div key={item} className="border border-hairline bg-surface-soft p-3">
                <div className="h-12 border border-hairline bg-surface-elevated" />
                <p className="mt-3 text-sm font-semibold text-body-strong">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function BuiltForCard({
  item,
}: {
  item: {
    title: string;
    fit: string;
    body: string;
    tags: string[];
  };
}) {
  return (
    <article className="border border-hairline bg-surface-soft p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="uppercase-label text-muted">{item.fit}</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-ink">
            {item.title}
          </h3>
        </div>
        <Layers className="h-5 w-5 shrink-0 text-m-blue-dark" aria-hidden="true" />
      </div>
      <p className="mt-5 text-sm leading-6 text-body">{item.body}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="border border-hairline bg-canvas px-3 py-2 text-xs font-semibold text-body-strong"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function DemoPreview() {
  return (
    <div className="border border-hairline bg-surface-soft">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-5">
        <div>
          <p className="uppercase-label text-muted">Customer catalogue</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            Kumar Residence selection
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs font-semibold text-body sm:flex">
          <span className="border border-hairline bg-canvas px-3 py-2">
            3 viewed
          </span>
          <span className="border border-m-blue-dark bg-m-blue-dark px-3 py-2 text-on-primary">
            2 shortlisted
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-hairline lg:grid-cols-[1fr_320px]">
        <div className="grid gap-px bg-hairline sm:grid-cols-3">
          {demoProducts.map((product) => (
            <article key={product.sku} className="bg-surface-soft p-4">
              <div className="aspect-[4/3] border border-hairline bg-canvas p-3">
                <div className="h-full border border-hairline bg-surface-elevated p-3">
                  <div className="h-1/2 border border-hairline bg-surface-soft" />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <span className="h-10 bg-[#7c6b5a]" />
                    <span className="h-10 bg-[#c7baa2]" />
                    <span className="h-10 bg-[#3e4152]" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="uppercase-label text-muted">{product.sku}</p>
                  <h3 className="mt-2 text-base font-semibold leading-tight text-ink">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-body">{product.finish}</p>
                </div>
                <span
                  className={
                    product.active
                      ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-m-blue-dark text-on-primary"
                      : "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline bg-canvas text-muted"
                  }
                  aria-label={product.note}
                >
                  <Heart
                    className={`h-4 w-4 ${product.active ? "fill-current" : ""}`}
                    aria-hidden="true"
                  />
                </span>
              </div>
              <p className="mt-4 border border-hairline bg-canvas px-3 py-2 text-xs font-semibold text-body-strong">
                {product.note}
              </p>
            </article>
          ))}
        </div>

        <aside className="bg-canvas p-5">
          <p className="uppercase-label text-muted">Compare tray</p>
          <h3 className="editorial-title mt-3 text-3xl leading-tight text-ink">
            Two options ready for family review
          </h3>
          <div className="mt-5 grid gap-3">
            <CompareRow label="Finish" first="Matte black" second="Muted bronze" />
            <CompareRow label="Lead time" first="21 days" second="18 days" />
            <CompareRow label="Use case" first="Facade" second="Balcony" />
          </div>
          <div className="mt-5 border border-hairline bg-surface-soft p-4">
            <p className="text-sm font-semibold text-ink">Sales note</p>
            <p className="mt-2 text-sm leading-6 text-body">
              Buyer prefers low-maintenance finish. Share quote for both options.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  first,
  second,
}: {
  label: string;
  first: string;
  second: string;
}) {
  return (
    <div className="grid grid-cols-[92px_1fr_1fr] gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="border border-hairline bg-surface-soft px-2 py-2 font-semibold text-body-strong">
        {first}
      </span>
      <span className="border border-hairline bg-surface-soft px-2 py-2 font-semibold text-body-strong">
        {second}
      </span>
    </div>
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
