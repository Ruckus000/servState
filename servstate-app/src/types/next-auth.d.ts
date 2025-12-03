import { UserRole } from './user';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    avatar?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      avatar?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    avatar?: string;
  }
}



