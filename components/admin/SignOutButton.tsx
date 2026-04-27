'use client';

import { signOut } from 'next-auth/react';
import { SignOut } from '@/components/icons';

/*
 * Tiny client island for the sign-out button in the admin layout.
 * Wraps next-auth/react's signOut so the surrounding layout stays a
 * server component.
 */
export default function SignOutButton() {
  return (
    <button
      type="button"
      className="adm-signout"
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
    >
      <SignOut size="1em" aria-hidden="true" /> Sign out
    </button>
  );
}
