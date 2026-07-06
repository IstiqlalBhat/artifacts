"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "My Library", hint: "Drafts & shipped work" },
  { href: "/directory", label: "SVS Directory", hint: "Shared with the org" },
  { href: "/new", label: "New artifact", hint: "Upload or paste code" },
];

export function MobileNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-sea/30 bg-shell-bright text-sea-deep transition-colors hover:bg-white"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Portaled: the blurred sticky header is a containing block for
          position:fixed, which would trap the overlay inside it. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col bg-shell sm:hidden">
          <div className="contour contour-fade-b" aria-hidden="true" />
          <div className="grain-soft" aria-hidden="true" />

          <div className="relative flex h-16 items-center justify-between px-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5"
            >
              <BrandMark />
              <span className="script text-[1.35rem] text-teal">Artifacts</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-sea/30 bg-shell-bright text-sea-deep"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="relative flex-1 overflow-y-auto px-5 pt-6">
            <p className="mono-label mb-4 text-teal-bright">Where to?</p>
            <ul className="flex flex-col">
              {links.map((link, i) => (
                <li
                  key={link.href}
                  className="border-b border-teal/10 last:border-b-0"
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between gap-4 py-5"
                  >
                    <span>
                      <span className="flex items-baseline gap-3">
                        <span className="display text-[0.7rem] font-bold text-sun-deep">
                          0{i + 1}
                        </span>
                        <span
                          className={cn(
                            "display text-[1.6rem] font-bold leading-none tracking-[-0.01em]",
                            pathname === link.href
                              ? "text-teal"
                              : "text-ink",
                          )}
                        >
                          {link.label}
                        </span>
                      </span>
                      <span className="mt-1.5 block pl-8 text-[0.82rem] text-ink-mute">
                        {link.hint}
                      </span>
                    </span>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-teal/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative border-t border-sea/15 bg-shell-bright/70 px-5 py-4 backdrop-blur">
            <p className="code-font truncate text-xs text-ink-mute">{email}</p>
            <form action="/auth/signout" method="post" className="mt-3">
              <button
                type="submit"
                className="btn-shell h-10 w-full text-sm"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
