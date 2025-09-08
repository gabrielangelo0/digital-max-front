import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, SessionDetails } from '@/types';

interface CartState {
  items: CartItem[];
  selectedSeats: string[];
  currentSession: SessionDetails | null;
  addItem: (item: CartItem) => void;
  removeItem: (seatId: string) => void;
  updateTicketType: (seatId: string, ticketType: 'inteira' | 'meia') => void;
  setCurrentSession: (session: SessionDetails | null) => void;
  selectSeat: (seatId: string) => void;
  unselectSeat: (seatId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedSeats: [],
      currentSession: null,

      addItem: (item) => {
        set((state) => ({
          items: [...state.items.filter(i => i.seatId !== item.seatId), item],
          selectedSeats: state.selectedSeats.includes(item.seatId) 
            ? state.selectedSeats 
            : [...state.selectedSeats, item.seatId]
        }));
      },

      removeItem: (seatId) => {
        set((state) => ({
          items: state.items.filter(item => item.seatId !== seatId),
          selectedSeats: state.selectedSeats.filter(id => id !== seatId)
        }));
      },

      updateTicketType: (seatId, ticketType) => {
        set((state) => ({
          items: state.items.map(item => 
            item.seatId === seatId 
              ? { 
                  ...item, 
                  ticketType, 
                  price: ticketType === 'meia' 
                    ? (state.currentSession?.basePrice || 0) * 0.5 
                    : (state.currentSession?.basePrice || 0)
                }
              : item
          )
        }));
      },

      setCurrentSession: (session) => {
        set({ currentSession: session });
      },

      selectSeat: (seatId) => {
        const state = get();
        if (!state.selectedSeats.includes(seatId) && state.currentSession) {
          const item: CartItem = {
            sessionId: state.currentSession.id,
            seatId,
            ticketType: 'inteira',
            price: state.currentSession.basePrice
          };
          state.addItem(item);
        }
      },

      unselectSeat: (seatId) => {
        get().removeItem(seatId);
      },

      clearCart: () => {
        set({ items: [], selectedSeats: [], currentSession: null });
      },

      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.price, 0);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'tickets.cart',
    }
  )
);