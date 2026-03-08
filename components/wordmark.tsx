import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="font-wordmark text-2xl tracking-tight select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--input-focus)] rounded-sm"
      aria-label="learnimo — página inicial"
    >
      <span className="font-normal text-heading">learn</span>
      <span className="font-bold text-[#D4854A]">imo</span>
    </Link>
  );
}
