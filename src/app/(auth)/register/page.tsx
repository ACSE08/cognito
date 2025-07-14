import { RegisterForm } from '@/components/auth/register-form';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h2 className="text-center text-2xl font-bold tracking-tight font-headline">
            Create an account
          </h2>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
