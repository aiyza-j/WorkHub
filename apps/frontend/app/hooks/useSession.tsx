
import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface SessionData {
  email: string;
  password: string;
  full_name: string;
  role: string;
  exp: number;
}

interface UseSessionReturn {
  session: SessionData | null;
  loading: boolean;
}

export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<SessionData>(token);
        if (decoded.exp * 1000 > Date.now()) {
          setSession(decoded);
        } else {
          localStorage.removeItem('token');
          alert('Invalid session. Please  log in again.');
          router.push('/login');

        }
      } catch {
        localStorage.removeItem('token');
        alert('Invalid session. Please log in again.');
        router.push('/login');

      }
    }
    setLoading(false);
  });

  return { session, loading };
};
