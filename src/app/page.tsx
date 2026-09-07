import Link from "next/link";
import { ArrowRight, Microphone, SpotifyLogo } from "@phosphor-icons/react/dist/ssr";
import { Container, Section, Kicker } from "@/components/ui/Container";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { CanvasTrail } from "@/components/ui/CanvasTrail";
import { GlowCard } from "@/components/ui/spotlight-card";
import { FounderPhoto } from "@/components/FounderPhoto";
import { EpisodeCarousel } from "@/components/EpisodeCarousel";
import { site, episodes, workshops, projects, facts } from "@/lib/data";

export default function Home() {

  const pillars = [
    {
      n: "01",
      title: "Podcast",
      description:
        "Deep, digestible episodes on history, geopolitics, business, economics and science — for the curious, not the credentialed.",
      href: "/podcast",
      cta: "Browse episodes",
    },
    {
      n: "02",
      title: "Academy",
      description:
        "Live, hands-on workshops on AI literacy and English proficiency — built to build real, usable skill.",
      href: "/academy",
      cta: "See workshops",
    },
    {
      n: "03",
      title: "Courses",
      description:
        "Structured, self-paced courses are next on the roadmap — for going deeper on the topics that matter most.",
      href: "/courses",
      cta: "Coming soon",
    },
  ];

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <CanvasTrail className="hidden md:block" />
        <Container className="relative z-10 grid gap-10 py-20 md:grid-cols-[1.5fr_1fr] md:gap-16 md:py-32">
          <div>
            <Reveal>
              <Kicker>Founded by Ishaan Garg</Kicker>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 max-w-2xl text-5xl leading-[1.04] tracking-tight text-foreground md:text-7xl">
                Knowledge should feel like a{" "}
                <em className="italic text-accent">groove</em>, not a grind.
              </h1>
            </Reveal>
            <Reveal delay={0.18} className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button href={site.spotifyShow} external>
                <Microphone size={16} weight="fill" />
                Listen to the podcast
              </Button>
              <Link
                href="/academy"
                className="focus-ring link-underline inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                Explore the Academy
                <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.24} className="flex flex-col justify-end">
            <p className="text-lg leading-relaxed text-muted">
              A podcast, an academy, and courses on the way — built for people who want
              to actually understand the world, one idea at a time.
            </p>
            <dl className="mt-8 grid max-w-sm grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-6">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dd className="numeral text-xl text-foreground">{fact.value}</dd>
                  <dt className="kicker mt-1 !text-muted-dim">{fact.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </div>

      {/* Founder */}
      <Section className="border-b border-border">
        <Container className="grid gap-10 md:grid-cols-[0.65fr_1.35fr] md:items-center">
          <Reveal>
            <FounderPhoto className="max-w-xs" />
          </Reveal>
          <Reveal delay={0.1}>
            <Kicker>The founder</Kicker>
            <h2 className="mt-6 font-display text-3xl leading-tight text-foreground md:text-4xl">
              {site.founder}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
              Knowledge Groove is built by Ishaan Garg — still in high school, already
              building the podcast, the academy, and this entire site himself.
            </p>
            <div className="mt-8">
              <Link href="/about" className="focus-ring link-underline inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Read the full story
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Ecosystem index */}
      <Section>
        <Container>
          <Reveal>
            <Kicker>The ecosystem</Kicker>
            <h2 className="mt-6 max-w-xl text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              One mission, three ways in.
            </h2>
          </Reveal>

          <RevealGroup className="mt-14 border-t border-border">
            {pillars.map((pillar) => (
              <Reveal key={pillar.n}>
                <Link
                  href={pillar.href}
                  className="focus-ring group grid grid-cols-[auto_1fr] items-start gap-6 border-b border-border py-8 transition-colors sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-10"
                >
                  <span className="numeral text-sm text-navy">{pillar.n}</span>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl text-foreground transition-colors group-hover:text-accent md:text-3xl">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                      {pillar.description}
                    </p>
                  </div>
                  <span className="col-span-2 mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground sm:col-span-1 sm:mt-0">
                    {pillar.cta}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* Featured episodes */}
      <Section className="border-y border-border bg-background-alt">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Kicker>The podcast</Kicker>
              <h2 className="mt-6 text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                Latest episodes
              </h2>
            </div>
            <Link href="/podcast" className="focus-ring link-underline hidden text-sm font-medium text-foreground sm:inline-flex">
              View all episodes
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <EpisodeCarousel episodes={episodes} spotifyHref={site.spotifyShow} />
          </Reveal>

          <Reveal className="mt-8 sm:hidden">
            <Link href="/podcast" className="focus-ring link-underline text-sm font-medium text-foreground">
              View all episodes
            </Link>
          </Reveal>
        </Container>
      </Section>

      {/* Academy teaser */}
      <Section>
        <Container className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <Kicker>The academy</Kicker>
            <h2 className="mt-6 text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Skills worth practicing, taught hands-on.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              The Academy runs live workshops on the skills that matter most right now —
              from understanding and using AI, to communicating with real confidence.
            </p>
            <div className="mt-8">
              <Link href="/academy" className="focus-ring link-underline inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Explore workshops
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          <RevealGroup className="border-t border-border">
            {workshops.map((w, i) => (
              <Reveal key={w.title}>
                <div className="border-b border-border py-6">
                  <span className="numeral text-xs text-navy">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-xl text-foreground">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{w.summary}</p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* Projects teaser */}
      <Section className="border-y border-border bg-background-alt">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Kicker>Beyond knowledge groove</Kicker>
              <h2 className="mt-6 text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                Other things I&apos;ve built
              </h2>
            </div>
            <Link href="/projects" className="focus-ring link-underline hidden text-sm font-medium text-foreground sm:inline-flex">
              View all projects
            </Link>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2">
            {projects.map((p) => (
              <Reveal key={p.name}>
                <GlowCard customSize className="flex h-full flex-col p-8">
                  <h3 className="font-display text-2xl text-foreground">{p.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                    {p.tags.map((tag) => (
                      <span key={tag} className="kicker !text-muted-dim">
                        {tag}
                      </span>
                    ))}
                  </div>
                </GlowCard>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section className="border-t border-border pb-28">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-8 border border-border-strong p-10 md:flex-row md:items-center md:p-14">
            <h2 className="max-w-lg text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Curious? Let&apos;s find your groove.
            </h2>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button href={site.spotifyShow} external>
                <SpotifyLogo size={16} weight="fill" />
                Listen now
              </Button>
              <Button href="/contact" variant="secondary">
                Get in touch
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
