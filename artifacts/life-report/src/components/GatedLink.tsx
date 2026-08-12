import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * External link (work link, course, or PDF). Links are open to all visitors;
 * only the "Ask Dr. K" dialogue requires Google sign-in.
 */
export function GatedLink({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return <a {...props}>{children}</a>;
}
