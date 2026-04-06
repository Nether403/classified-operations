import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
}

export function useAuth() {
  const { data, isLoading } = useQuery<AuthState>({
    queryKey: ["auth-user"],
    queryFn: () => apiFetch<AuthState>("/auth/me"),
    staleTime: 60_000,
    retry: false,
  });

  return {
    user: data?.user ?? null,
    isAuthenticated: !!data?.user,
    isLoading,
  };
}
