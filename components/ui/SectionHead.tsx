import type { ReactNode } from "react";
import { SplitTitle } from "./SplitTitle";

type Props = { eyebrow: string; title: string; maxWidth?: string; aside?: ReactNode; as?: "h1" | "h2" };

export function SectionHead({ eyebrow, title, maxWidth, aside, as = "h2" }: Props) {
  return (
    <div className="sec-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <SplitTitle as={as} text={title} style={maxWidth ? { maxWidth } : undefined} />
      </div>
      {aside}
    </div>
  );
}
