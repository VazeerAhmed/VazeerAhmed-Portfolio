import Link from "next/link";
import React, { ComponentPropsWithoutRef } from "react";

type AnchorProps = ComponentPropsWithoutRef<"a">;

function Anchor({ href, children, ...props }: AnchorProps) {
  if (href?.startsWith("/")) {
    return (
      <Link
        className="underline transition-all decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2 decoration-[0.1em] hover:decoration-neutral-700 dark:hover:decoration-neutral-300"
        href={href}
        {...props}
      >
        {children}
      </Link>
    );
  }

  if (href?.startsWith("#")) {
    return (
      <a
        className="underline transition-all decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2 decoration-[0.1em] hover:decoration-neutral-700 dark:hover:decoration-neutral-300"
        href={href}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      className="underline transition-all decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2 decoration-[0.1em] hover:decoration-neutral-700 dark:hover:decoration-neutral-300"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}

export { Anchor };
export type { AnchorProps };
export default Anchor;
