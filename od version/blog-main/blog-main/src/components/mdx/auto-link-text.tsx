import React from "react";
import { Anchor } from "@/components/mdx/anchor";

// URL 正則表達式，用於檢測各種格式的 URL
const URL_REGEX = /(https?:\/\/[^\s<>"]+)/gi;

interface AutoLinkTextProps {
  children: string;
}

/**
 * 自動將文本中的 URL 轉換為可點擊的連結
 */
function AutoLinkText({ children }: AutoLinkTextProps) {
  if (typeof children !== "string") {
    return <>{children}</>;
  }

  const parts = children.split(URL_REGEX);

  return (
    <>
      {parts.map((part, index) => {
        // 檢查是否為 URL
        if (URL_REGEX.test(part)) {
          // 重置正則表達式的 lastIndex
          URL_REGEX.lastIndex = 0;

          return (
            <Anchor
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </Anchor>
          );
        }

        return part;
      })}
    </>
  );
}

export { AutoLinkText };
