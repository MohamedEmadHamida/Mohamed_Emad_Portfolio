import { Fragment, type CSSProperties } from "react";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
};

/** Heading whose words slide up line by line when it scrolls into view (see RevealObserver). */
export function SplitTitle({ text, as: Tag = "h2", className = "display", style }: Props) {
  const words = text.trim().split(/\s+/);
  return (
    <Tag className={className} style={style} data-split aria-label={words.join(" ")}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w" aria-hidden="true">
            <span className="wi">{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
