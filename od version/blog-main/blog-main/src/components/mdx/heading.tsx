import React, { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import Link from "next/link";
import slugify from "@/lib/slugify";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingProps<T extends HeadingTag> = ComponentPropsWithoutRef<T> & {
  as?: T;
};

function Heading<T extends HeadingTag = "h1">(props: HeadingProps<T>) {
  const { as, className, children, ...rest } = props;
  const Component = as ?? "h1";

  const headingId = slugify(children?.toString() ?? "", { lower: true });

  return (
    <Component className={cn("scroll-m-4", className)} id={headingId} {...rest}>
      <Link href={`#${headingId}`} className="anchor" />
      {children}
    </Component>
  );
}

export type { HeadingProps };
export { Heading };
export default Heading;
