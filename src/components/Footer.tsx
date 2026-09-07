import Link from "next/link";
import { SpotifyLogo, EnvelopeSimple, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";
import { Container } from "./ui/Container";
import { MailLink } from "./MailLink";
import { site } from "@/lib/data";

const explore = [
  { href: "/podcast", label: "Podcast" },
  { href: "/academy", label: "Academy" },
  { href: "/courses", label: "Courses" },
  { href: "/projects", label: "Projects" },
];

const more = [
  { href: "/about", label: "About the founder" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-alt">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">
            An ecosystem for curious minds: a podcast, workshops, and (soon) courses,
            built by a high schooler who wanted knowledge to feel like a groove, not a grind.
          </p>
        </div>

        <FooterColumn title="Explore" items={explore} />
        <FooterColumn title="More" items={more} />

        <div>
          <h3 className="kicker">Get in touch</h3>
          <MailLink
            email={site.email}
            href={`mailto:${site.email}`}
            className="focus-ring link-underline mt-4 inline-flex items-center gap-1.5 text-sm text-foreground"
          >
            <EnvelopeSimple size={15} />
            {site.email}
          </MailLink>
          <div className="mt-3">
            <a
              href={site.spotifyShow}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring link-underline inline-flex items-center gap-1.5 text-sm text-foreground"
            >
              <SpotifyLogo size={15} />
              Listen on Spotify
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-muted-dim md:flex-row">
          <p>&copy; {new Date().getFullYear()} Knowledge Groove. Founded by {site.founder}.</p>
          <p className="font-mono">Built with curiosity, in California.</p>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="kicker">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="focus-ring text-sm text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
