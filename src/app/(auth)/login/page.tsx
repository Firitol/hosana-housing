import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Hosana Nexus',
  description: 'Login to your Hosana Nexus account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
