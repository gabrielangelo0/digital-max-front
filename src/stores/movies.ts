import { create } from 'zustand';
import { Movie, Cinema, Session, Room, SessionDetails } from '@/types';

interface MoviesState {
  movies: Movie[];
  cinemas: Cinema[];
  sessions: Session[];
  rooms: Room[];
  loadData: () => void;
  getMovieById: (id: string) => Movie | undefined;
  getCinemaById: (id: string) => Cinema | undefined;
  getRoomById: (id: string) => Room | undefined;
  getSessionById: (id: string) => SessionDetails | undefined;
  getSessionsByMovie: (movieId: string) => SessionDetails[];
  getSessionsByCity: (movieId: string, city: string) => SessionDetails[];
  getSessionsByCinema: (movieId: string, cinemaId: string) => SessionDetails[];
  getCitiesForMovie: (movieId: string) => string[];
  getCinemasForMovie: (movieId: string, city: string) => Cinema[];
  updateOccupiedSeats: (sessionId: string, newOccupiedSeats: string[]) => void;
}

export const useMoviesStore = create<MoviesState>((set, get) => ({
  movies: [],
  cinemas: [],
  sessions: [],
  rooms: [],

  loadData: () => {
    const moviesData = localStorage.getItem('tickets.movies');
    const cinemasData = localStorage.getItem('tickets.cinemas');
    const sessionsData = localStorage.getItem('tickets.sessions');
    const roomsData = localStorage.getItem('tickets.rooms');

    set({
      movies: moviesData ? JSON.parse(moviesData) : [],
      cinemas: cinemasData ? JSON.parse(cinemasData) : [],
      sessions: sessionsData ? JSON.parse(sessionsData) : [],
      rooms: roomsData ? JSON.parse(roomsData) : [],
    });
  },

  getMovieById: (id) => {
    return get().movies.find(movie => movie.id === id);
  },

  getCinemaById: (id) => {
    return get().cinemas.find(cinema => cinema.id === id);
  },

  getRoomById: (id) => {
    return get().rooms.find(room => room.id === id);
  },

  getSessionById: (id) => {
    const state = get();
    const session = state.sessions.find(s => s.id === id);
    if (!session) return undefined;

    const movie = state.getMovieById(session.movieId);
    const cinema = state.getCinemaById(session.cinemaId);
    const room = state.getRoomById(session.roomId);

    if (!movie || !cinema || !room) return undefined;

    return {
      ...session,
      movie,
      cinema,
      room,
    };
  },

  getSessionsByMovie: (movieId) => {
    const state = get();
    return state.sessions
      .filter(session => session.movieId === movieId && session.isActive)
      .map(session => state.getSessionById(session.id))
      .filter(Boolean) as SessionDetails[];
  },

  getSessionsByCity: (movieId, city) => {
    const state = get();
    const citySessions = state.getSessionsByMovie(movieId)
      .filter(session => session.cinema.city === city);
    return citySessions;
  },

  getSessionsByCinema: (movieId, cinemaId) => {
    const state = get();
    return state.getSessionsByMovie(movieId)
      .filter(session => session.cinemaId === cinemaId);
  },

  getCitiesForMovie: (movieId) => {
    const state = get();
    const sessions = state.getSessionsByMovie(movieId);
    const cities = [...new Set(sessions.map(session => session.cinema.city))];
    return cities.sort();
  },

  getCinemasForMovie: (movieId, city) => {
    const state = get();
    const sessions = state.getSessionsByCity(movieId, city);
    const cinemaIds = [...new Set(sessions.map(session => session.cinemaId))];
    return cinemaIds
      .map(id => state.getCinemaById(id))
      .filter(Boolean) as Cinema[];
  },

  updateOccupiedSeats: (sessionId, newOccupiedSeats) => {
    set((state) => ({
      sessions: state.sessions.map(session =>
        session.id === sessionId
          ? { ...session, occupiedSeats: newOccupiedSeats }
          : session
      )
    }));

    // Atualizar no localStorage
    const sessionsData = localStorage.getItem('tickets.sessions');
    if (sessionsData) {
      const sessions = JSON.parse(sessionsData);
      const updatedSessions = sessions.map((session: Session) =>
        session.id === sessionId
          ? { ...session, occupiedSeats: newOccupiedSeats }
          : session
      );
      localStorage.setItem('tickets.sessions', JSON.stringify(updatedSessions));
    }
  },
}));