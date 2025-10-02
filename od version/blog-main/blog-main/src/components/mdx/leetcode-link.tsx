import React from "react";
import Link from "next/link";

interface LeetCodeLinkProps {
  title: string;
  url: string;
}

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LeetCodeLink({ url, title }: LeetCodeLinkProps) {
  if (!url) {
    return null;
  }

  return (
    <Link
      className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
      rel="noopener noreferrer"
      target="_blank"
      href={url}
    >
      <div className="mr-2 h-7">{title}</div>
      <ArrowIcon />
    </Link>
  );
}

export { LeetCodeLink };
export default LeetCodeLink;
