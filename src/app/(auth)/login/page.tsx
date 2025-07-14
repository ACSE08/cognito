import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h2 className="text-center text-2xl font-bold tracking-tight font-headline">
            Welcome back
          </h2>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
