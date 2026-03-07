"use client";

import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--nav-border)] bg-[var(--nav-bg)]">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* Wordmark */}
        <div className="flex items-center">
          <span className="font-brand text-xl tracking-tight">
            <span className="font-normal text-[var(--foreground)]">learn</span>
            <span className="font-bold text-[var(--accent)]">imo</span>
          </span>
        </div>

        {/* User avatar */}
        <button
          type="button"
          className="relative h-8 w-8 overflow-hidden rounded-full bg-[var(--secondary)] transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          aria-label="Menu do usuário"
        >
          <Image
            src="/placeholder-avatar.svg"
            alt="Avatar do usuário"
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}
