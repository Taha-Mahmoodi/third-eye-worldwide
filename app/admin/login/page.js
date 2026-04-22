import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in — TEWW CMS' };

export default async function LoginPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const callbackUrl = typeof sp.callbackUrl === 'string' ? sp.callbackUrl : '/admin';
  const error = typeof sp.error === 'string' ? sp.error : null;
  return <LoginForm callbackUrl={callbackUrl} error={error} />;
}
