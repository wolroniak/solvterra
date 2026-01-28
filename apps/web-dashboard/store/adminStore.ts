import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AdminInfo {
  id: string;
  userId: string;
  role: 'super_admin' | 'admin' | 'moderator';
  name: string | null;
  email: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: AdminInfo | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  admin: null,

  checkSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        set({ isAuthenticated: false, isLoading: false, admin: null });
        return;
      }

      // Check if user is a SolvTerra admin
      const { data: adminData, error: adminError } = await supabase
        .rpc('get_admin_info');

      if (adminError || !adminData || adminData.length === 0) {
        set({ isAuthenticated: false, isLoading: false, admin: null });
        return;
      }

      const admin = adminData[0];
      set({
        isAuthenticated: true,
        isLoading: false,
        admin: {
          id: admin.id,
          userId: admin.user_id,
          role: admin.role,
          name: admin.name,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error('Admin session check failed:', error);
      set({ isAuthenticated: false, isLoading: false, admin: null });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login fehlgeschlagen' };
      }

      // Check if user is a SolvTerra admin
      const { data: adminData, error: adminError } = await supabase
        .rpc('get_admin_info');

      if (adminError || !adminData || adminData.length === 0) {
        // User is not an admin, sign them out
        await supabase.auth.signOut();
        return { success: false, error: 'Kein Admin-Zugang. Dieser Login ist nur fuer SolvTerra-Mitarbeiter.' };
      }

      const admin = adminData[0];
      set({
        isAuthenticated: true,
        admin: {
          id: admin.id,
          userId: admin.user_id,
          role: admin.role,
          name: admin.name,
          email: admin.email,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Admin login failed:', error);
      return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Admin logout error:', error);
    }
    set({ isAuthenticated: false, admin: null });
  },
}));
