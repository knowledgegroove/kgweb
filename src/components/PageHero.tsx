import type { ReactNode } from "react";
import { Container } from "./ui/Container";
import { Kicker } from "./ui/Container";
import { Reveal } from "./ui/Reveal";

export function PageHero({
  eyebrow,
  index,
  title,
  description,
  children,
}: {
  eyebrow: string;
  index?: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-border pb-16 pt-16 md:pb-20 md:pt-20">
      <Container>
        <Reveal>
          <Kicker index={index}>{eyebrow}</Kicker>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-7 max-w-3xl text-4xl leading-[1.08] tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{description}</p>
        </Reveal>
        {children && (
          <Reveal delay={0.24} className="mt-9">
            {children}
          </Reveal>
        )}
      </Container>
    </div>
  );
}
