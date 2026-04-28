import { RegisterForm } from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Hosana Nexus',
  description: 'Create a new Hosana Nexus account.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
