import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, authLoading, signOut, supabase };
}
