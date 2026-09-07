import type { Metadata } from "next";
import { ArrowUpRight, SpotifyLogo, Star } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { site, episodes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "The Knowledge Groove Podcast — deep dives into history, geopolitics, business, economics and science. 50+ episodes and counting.",
};

export default function PodcastPage() {
  return (
    <>
      <PageHero
        eyebrow="The Knowledge Groove Podcast"
        index="I"
        title="Curiosity, one episode at a time."
        description={`"Education is the most powerful weapon we can use to change the world." Each episode explores history, geopolitics, business, economics, and science — built to deepen your understanding and spark curiosity about the world around you.`}
      >
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Button href={site.spotifyShow} external>
            <SpotifyLogo size={16} weight="fill" />
            Listen on Spotify
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Star size={15} weight="fill" className="text-accent" />
            <span className="numeral font-medium text-foreground">5.0</span>
            <span>rating &middot; 50+ episodes &middot; Education</span>
          </div>
        </div>
      </PageHero>

      <Section className="pt-14 md:pt-16">
        <Container>
          <Reveal className="flex items-baseline justify-between border-b border-border-strong pb-4">
            <h2 className="kicker">Episode</h2>
            <h2 className="kicker hidden sm:block">Released</h2>
          </Reveal>

          <RevealGroup className="mt-6 flex flex-col gap-4">
            {episodes.map((ep, i) => (
              <Reveal key={ep.title}>
                <a href={site.spotifyShow} target="_blank" rel="noopener noreferrer" className="focus-ring block">
                  <GlowCard
                    customSize
                    className="group grid grid-cols-[2.5rem_1fr] gap-5 p-6 sm:grid-cols-[2.5rem_1fr_9rem_1.5rem] sm:items-start sm:gap-8 sm:p-7"
                  >
                    <span className="numeral pt-1 text-sm text-navy">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl text-foreground transition-colors group-hover:text-accent md:text-2xl">
                        {ep.title}
                      </h3>
                      <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">{ep.description}</p>
                      <span className="numeral mt-3 block text-xs text-muted-dim sm:hidden">
                        {ep.date} &middot; {ep.duration}
                      </span>
                    </div>
                    <span className="numeral hidden pt-1 text-right text-xs leading-relaxed text-muted-dim sm:block">
                      {ep.date}
                      <br />
                      {ep.duration}
                    </span>
                    <ArrowUpRight
                      size={17}
                      className="hidden pt-1 text-muted-dim transition-colors group-hover:text-accent sm:block"
                    />
                  </GlowCard>
                </a>
              </Reveal>
            ))}
          </RevealGroup>

          <Reveal className="mt-14 flex justify-start">
            <Button href={site.spotifyShow} external variant="secondary">
              <SpotifyLogo size={16} weight="fill" />
              See the full catalog on Spotify
            </Button>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
