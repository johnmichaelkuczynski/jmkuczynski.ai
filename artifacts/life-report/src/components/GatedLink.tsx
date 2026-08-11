import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * An external link (work link or PDF) that requires sign-in.
 * Logged-out visitors get a friendly Google sign-in reminder instead.
 */
export function GatedLink({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  const { user, promptLogin } = useAuth();

  return (
    <a
      {...props}
      onClick={(e) => {
        if (!user) {
          e.preventDefault();
          promptLogin();
        }
      }}
    >
      {children}
    </a>
  );
}
