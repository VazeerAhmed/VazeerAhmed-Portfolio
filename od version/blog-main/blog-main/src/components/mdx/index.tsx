import React, { ComponentPropsWithoutRef } from "react";
import rehypeShiki from "@shikijs/rehype";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Heading, type HeadingProps } from "@/components/mdx/heading";
import { CodeBlock } from "@/components/mdx/code-block";
import remarkFootnotes from "remark-gfm";
import { MarkdownAlert, Highlight } from "@/components/mdx/markdown-alert";
import { LeetCodeLink } from "@/components/mdx/leetcode-link";
import { AutoLinkText } from "@/components/mdx/auto-link-text";
import EmblaCarousel from "@/components/embla-carousel";
import { Anchor, type AnchorProps } from "@/components/mdx/anchor";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListItem, type ListItemProps } from "@/components/mdx/list-item";
import {
  OrderedList,
  type OrderedListProps,
} from "@/components/mdx/ordered-list";
import {
  UnorderedList,
  type UnorderedListProps,
} from "@/components/mdx/unordered-list";
import { RedditEmbed } from "@/components/reddit-embed";
import { Tweet } from "@/components/tweet";
import { GitHubMap } from "@/components/github-map";

import styles from "@/styles/md.module.css";

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />;
}

function CustomParagraph({ children, ...props }) {
  const processChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return <AutoLinkText>{child}</AutoLinkText>;
      }
      return child;
    });
  };

  return <p {...props}>{processChildren(children)}</p>;
}

let components = {
  h1: (props: HeadingProps<"h1">) => <Heading as="h1" {...props} />,
  h2: (props: HeadingProps<"h2">) => <Heading as="h2" {...props} />,
  h3: (props: HeadingProps<"h3">) => <Heading as="h3" {...props} />,
  h4: (props: HeadingProps<"h4">) => <Heading as="h4" {...props} />,
  h5: (props: HeadingProps<"h5">) => <Heading as="h5" {...props} />,
  h6: (props: HeadingProps<"h6">) => <Heading as="h6" {...props} />,
  Image: RoundedImage,
  a: (props: AnchorProps) => <Anchor {...props} />,
  p: CustomParagraph,
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className={styles.code} {...props} />
  ),
  pre: ({ ...props }: React.HTMLAttributes<HTMLElement>) => (
    <CodeBlock className={cn(styles.pre)} {...props} />
  ),
  li: (props: ListItemProps) => <ListItem {...props} />,
  ol: (props: OrderedListProps) => <OrderedList {...props} />,
  ul: (props: UnorderedListProps) => <UnorderedList {...props} />,
  Table,
  MarkdownAlert,
  Highlight,
  LeetCodeLink,
  EmblaCarousel,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  RedditEmbed,
  Tweet,
  GitHubMap,
};

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...props.components }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkFootnotes],
          rehypePlugins: [
            [
              rehypeShiki,
              {
                themes: {
                  light: "github-light",
                  dark: "github-dark",
                },
                addLanguageClass: true,
                defaultColor: false,
              },
            ],
          ],
        },
      }}
    />
  );
}
