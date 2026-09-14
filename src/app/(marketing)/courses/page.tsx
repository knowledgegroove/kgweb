import type { Metadata } from "next";
import { BookOpen, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Courses",
  description: "Self-paced Knowledge Groove courses are coming soon, the next chapter of the ecosystem.",
};

export default function CoursesPage() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        index="III"
        title="Structured courses are the next chapter."
        description="After the podcast and the Academy, courses are the natural next step: self-paced, in-depth, and built for people who want to go further on a topic than a single episode or workshop allows."
      />

      <Section className="pt-14 pb-28 md:pt-16">
        <Container>
          <Reveal className="flex flex-col items-start gap-8 border border-border-strong p-10 md:flex-row md:items-center md:p-16">
            <BookOpen size={40} weight="light" className="shrink-0 text-accent" />
            <div>
              <h2 className="font-display text-2xl text-foreground md:text-3xl">
                Courses are in the works.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                Nothing to enroll in yet, but if you want to be first in line when
                Knowledge Groove courses launch, reach out and I&apos;ll keep you posted.
              </p>
              <div className="mt-7">
                <Button href="/contact">
                  <EnvelopeSimple size={16} />
                  Get notified
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
