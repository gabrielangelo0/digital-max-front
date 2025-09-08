// Tipos principais da aplicação CineMax

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  trailerUrl?: string;
  genre: string;
  duration: number; // em minutos
  ageRating: number; // classificação indicativa
  releaseDate: string;
  isActive: boolean;
}

export interface Cinema {
  id: string;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  cinemaId: string;
  name: string;
  type: '2D' | '3D' | 'IMAX' | 'VIP';
  rows: number;
  columns: number;
  totalSeats: number;
  accessibleSeats: string[]; // ["A1", "A2", etc]
}

export interface Session {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  date: string;
  time: string;
  basePrice: number;
  occupiedSeats: string[];
  isActive: boolean;
}

export interface Seat {
  id: string; // "A1", "B5", etc
  row: string;
  number: number;
  type: 'regular' | 'accessible';
  status: 'available' | 'selected' | 'occupied';
}

export interface TicketType {
  type: 'inteira' | 'meia';
  price: number;
  requiresProof: boolean;
}

export interface CartItem {
  sessionId: string;
  seatId: string;
  ticketType: 'inteira' | 'meia';
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  sessionId: string;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  date: string;
  time: string;
  seats: Array<{
    seatId: string;
    ticketType: 'inteira' | 'meia';
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  cardNumber: string; // mascarado
  createdAt: string;
  qrCode: string;
  status: 'confirmed' | 'cancelled';
}

export interface SessionDetails extends Session {
  movie: Movie;
  cinema: Cinema;
  room: Room;
}

export interface StepperStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  installments: number;
}

export interface FilterOptions {
  search: string;
  genre: string;
  city: string;
  cinema: string;
}