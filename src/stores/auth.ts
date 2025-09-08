import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<User | null>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const usersData = localStorage.getItem('tickets.users');
          const users: User[] = usersData ? JSON.parse(usersData) : [];
          
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            set({ user, isAuthenticated: true });
            return user;
          }
          return null;
        } catch (error) {
          console.error('Erro no login:', error);
          return null;
        }
      },

      register: async (userData) => {
        try {
          const usersData = localStorage.getItem('tickets.users');
          const users: User[] = usersData ? JSON.parse(usersData) : [];
          
          // Verificar se email já existe
          if (users.find(u => u.email === userData.email)) {
            return null;
          }
          
          const newUser: User = {
            ...userData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          };
          
          users.push(newUser);
          localStorage.setItem('tickets.users', JSON.stringify(users));
          
          set({ user: newUser, isAuthenticated: true });
          return newUser;
        } catch (error) {
          console.error('Erro no cadastro:', error);
          return null;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: () => {
        const state = get();
        if (state.user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'tickets.auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);