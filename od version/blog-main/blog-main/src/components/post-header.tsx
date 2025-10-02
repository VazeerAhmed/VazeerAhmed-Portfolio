import Link from "next/link";

import { FadeUp } from "@/components/animations";

export function PostHeader() {
  return (
    <header className="flex my-10 items-center">
      <FadeUp delay={0.3 * 2}>
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <h1 className="font-extrabold">Hugo Lin</h1>
          </Link>
        </div>
      </FadeUp>

      <nav className="font-mono text-xs grow justify-end items-center flex gap-1 md:gap-3">
        <FadeUp delay={0.3 * 2}>
          <Link
            href="/archive"
            className="inline-flex hover:bg-gray-200 dark:hover:bg-[#313131] active:bg-gray-300 dark:active:bg-[#242424] rounded-sm p-2 transition-[background-color]"
          >
            Archive
          </Link>
        </FadeUp>
      </nav>
    </header>
  );
}
