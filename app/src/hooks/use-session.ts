import useSWR from "swr";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Session {
  user: User;
  expires: string;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) return null;
    return r.json();
  });

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<Session | null>(
    "/api/auth/session",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 60_000 },
  );

  return {
    session: data ?? null,
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    mutate,
  };
}
