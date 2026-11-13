import type { AnchorHTMLAttributes } from "react";

export function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a target="_blank" rel="noreferrer noopener" {...props} />;
}
