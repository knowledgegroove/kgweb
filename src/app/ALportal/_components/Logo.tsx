import Image from "next/image";

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/al-portal-logo.jpg"
      alt="Academic Leadership logo"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      priority
    />
  );
}

export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return <LogoMark size={size} className={className} />;
}
