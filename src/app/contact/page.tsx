import type { Metadata } from "next";
import { EnvelopeSimple, SpotifyLogo, GraduationCap, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Knowledge Groove and Ishaan Garg.",
};

const cards = [
  {
    icon: EnvelopeSimple,
    title: "Email",
    description: "The fastest way to reach me directly — questions, ideas, or collaborations all welcome.",
    href: `mailto:${site.email}`,
    label: site.email,
  },
  {
    icon: SpotifyLogo,
    title: "Podcast",
    description: "Listen to the latest episodes, subscribe, and leave a review on Spotify.",
    href: site.spotifyShow,
    label: "Open on Spotify",
  },
  {
    icon: GraduationCap,
    title: "Academy",
    description: "Interested in an AI or English proficiency workshop? Mention it in your email.",
    href: `mailto:${site.email}?subject=Academy%20Workshop%20Inquiry`,
    label: "Ask about a workshop",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        index="VI"
        title="Let's find your groove."
        description="Whether it's about the podcast, a workshop, a project, or just to say hello — I read every message myself."
      />

      <Section className="pt-14 pb-28 md:pt-16">
        <Container>
          <RevealGroup className="grid gap-px overflow-hidden border border-border-strong md:grid-cols-3">
            {cards.map((card) => (
              <Reveal key={card.title}>
                <a
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="focus-ring group flex h-full flex-col bg-surface p-8"
                >
                  <card.icon size={24} weight="light" className="text-accent" />
                  <h2 className="mt-6 font-display text-xl text-foreground">{card.title}</h2>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{card.description}</p>
                  <span className="link-underline mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {card.label}
                    <ArrowUpRight size={14} />
                  </span>
                </a>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </Section>
    </>
  );
}
