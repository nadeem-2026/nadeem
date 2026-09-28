import Image from "next/image";

export function Brand({ name, reverse = false }: { name: string; reverse?: boolean }) {
  return <Image
    className="brand-logo"
    src={`/brand/nadeem-logo-${reverse ? "reverse" : "primary"}.svg`}
    alt={name}
    width={1574}
    height={698}
    priority={!reverse}
  />;
}
