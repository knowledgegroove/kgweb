import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section, Kicker } from "@/components/ui/Container";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { FounderPhoto } from "@/components/FounderPhoto";
import { about, site } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: `${site.founder} is a high schooler at ${about.school} and the founder of Knowledge Groove.`,
};

const interests = ["Tennis", "Math", "Physics", "Community Service"];

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-border">
        <Container className="grid gap-12 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-20">
          <Reveal>
            <FounderPhoto className="max-w-sm" />
          </Reveal>

          <Reveal delay={0.1}>
            <Kicker index="V">The founder</Kicker>
            <h1 className="mt-6 text-4xl leading-[1.08] tracking-tight text-foreground md:text-6xl">
              {site.founder}
            </h1>
            <p className="mt-3 font-mono text-sm uppercase tracking-wide text-accent">
              Founder, Knowledge Groove &middot; Student, {about.school}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">{about.bio}</p>
            <div className="mt-8">
              <Button href="/contact">
                Get in touch
                <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </Container>
      </div>

      <Section className="border-b border-border bg-background-alt">
        <Container>
          <Reveal className="max-w-xl">
            <Kicker>Beyond the desk</Kicker>
            <h2 className="mt-6 text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              What fills the rest of the schedule
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-px overflow-hidden border border-border-strong sm:grid-cols-2 lg:grid-cols-4">
            {interests.map((label, i) => (
              <Reveal key={label}>
                <div className="flex h-full flex-col gap-4 bg-surface p-7">
                  <span className="numeral text-xs text-navy">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-lg text-foreground">{label}</h3>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section className="pb-28">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-8 border border-border-strong p-10 md:flex-row md:items-center md:p-14">
            <h2 className="max-w-lg text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Building Knowledge Groove, one episode and workshop at a time.
            </h2>
            <Button href="/contact" className="shrink-0">
              Reach out
              <ArrowRight size={16} />
            </Button>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
