'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from '@/components/icons';

/*
 * Generic side-drawer used by both VolunteerDrawer and DonationDrawer
 * (CMS_ROADMAP PR #4). Renders nothing when `open` is false; when
 * open, slides in from the right, traps focus, and closes on Escape.
 *
 * Why generic: VolunteerDrawer and DonationDrawer have different
 * detail fields but identical chrome (header, close button, focus
 * trap, body scroll lock). One component avoids repeating all of
 * that twice.
 *
 * Focus management:
 *  - On open, focus moves to the close button so SR users hear the
 *    drawer label, not the row they came from.
 *  - On close, focus restores to the previously-focused element.
 *  - Tab/Shift+Tab cycle inside the drawer until close.
 */

export interface SubmissionDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Optional id for aria-labelledby on the dialog. */
  id?: string;
}

export default function SubmissionDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  id = 'submission-drawer',
}: SubmissionDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus management on open / close.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // Move focus into the drawer once it has rendered.
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes; Tab cycles inside.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Don't render anything until mounted to avoid hydration mismatch.
  if (!mounted || !open) return null;

  return (
    <div
      className="adm-drawer-backdrop"
      aria-hidden="true"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="adm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="adm-drawer-header">
          <div>
            <h2 id={`${id}-title`}>{title}</h2>
            {subtitle ? <p className="adm-drawer-sub">{subtitle}</p> : null}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="adm-btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size="1em" aria-hidden="true" />
          </button>
        </header>
        <div className="adm-drawer-body">{children}</div>
      </div>
    </div>
  );
}
