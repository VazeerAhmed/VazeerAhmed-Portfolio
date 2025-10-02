import Link from "next/link";
import { FadeIn } from "@/components/animations";

export function Footer() {
  return (
    <footer className="my-10 text-xs dark:text-neutral-300 text-neutral-600 font-mono">
      <FadeIn>
        <div className="flex">
          <div className="grow text-left">
            Hugo Lin (
            <Link
              className="underline transition-all decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2 decoration-[0.1em] hover:decoration-neutral-700 dark:hover:decoration-neutral-300"
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/1chooo"
            >
              @1chooo
            </Link>
            )
          </div>
          <Link
            className="underline transition-all decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2 decoration-[0.1em] hover:decoration-neutral-700 dark:hover:decoration-neutral-300"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/1chooo/blog"
          >
            Source
          </Link>
        </div>
      </FadeIn>
    </footer>
  );
}
