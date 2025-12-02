import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Redirect based on actual user role
  if (session.user.role === 'borrower') {
    redirect('/borrower');
  } else {
    redirect('/servicer');
  }
}
