import { create } from 'zustand';
import { Movie, Cinema, Session, Room, SessionDetails } from '@/types';

interface MoviesState {
  movies: Movie[];
  cinemas: Cinema[];
  sessions: Session[];
  rooms: Room[];
  loadData: () => void;
  // Movie CRUD operations
  addMovie: (movie: Omit<Movie, 'id' | 'isActive'>) => void;
  updateMovie: (id: string, movie: Omit<Movie, 'id' | 'isActive'>) => void;
  deleteMovie: (id: string) => void;
  toggleMovieStatus: (id: string) => void;
  // Cinema CRUD operations
  addCinema: (cinema: Omit<Cinema, 'id' | 'isActive'>) => void;
  updateCinema: (id: string, cinema: Omit<Cinema, 'id' | 'isActive'>) => void;
  deleteCinema: (id: string) => void;
  toggleCinemaStatus: (id: string) => void;
  // Room CRUD operations
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Omit<Room, 'id'>) => void;
  deleteRoom: (id: string) => void;
  // Session CRUD operations
  addSession: (session: Omit<Session, 'id' | 'isActive'>) => void;
  updateSession: (id: string, session: Omit<Session, 'id' | 'isActive'>) => void;
  deleteSession: (id: string) => void;
  toggleSessionStatus: (id: string) => void;
  // Getter functions
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

  // Movie CRUD operations
  addMovie: (movieData) => {
    const newMovie: Movie = {
      ...movieData,
      id: crypto.randomUUID(),
      isActive: true,
    };

    set((state) => {
      const updatedMovies = [...state.movies, newMovie];
      localStorage.setItem('tickets.movies', JSON.stringify(updatedMovies));
      return { movies: updatedMovies };
    });
  },

  updateMovie: (id, movieData) => {
    set((state) => {
      const updatedMovies = state.movies.map(movie =>
        movie.id === id ? { ...movie, ...movieData } : movie
      );
      localStorage.setItem('tickets.movies', JSON.stringify(updatedMovies));
      return { movies: updatedMovies };
    });
  },

  deleteMovie: (id) => {
    set((state) => {
      const updatedMovies = state.movies.filter(movie => movie.id !== id);
      localStorage.setItem('tickets.movies', JSON.stringify(updatedMovies));
      return { movies: updatedMovies };
    });
  },

  toggleMovieStatus: (id) => {
    set((state) => {
      const updatedMovies = state.movies.map(movie =>
        movie.id === id ? { ...movie, isActive: !movie.isActive } : movie
      );
      localStorage.setItem('tickets.movies', JSON.stringify(updatedMovies));
      return { movies: updatedMovies };
    });
  },

  // Cinema CRUD operations
  addCinema: (cinemaData) => {
    const newCinema: Cinema = {
      ...cinemaData,
      id: crypto.randomUUID(),
      isActive: true,
    };

    set((state) => {
      const updatedCinemas = [...state.cinemas, newCinema];
      localStorage.setItem('tickets.cinemas', JSON.stringify(updatedCinemas));
      return { cinemas: updatedCinemas };
    });
  },

  updateCinema: (id, cinemaData) => {
    set((state) => {
      const updatedCinemas = state.cinemas.map(cinema =>
        cinema.id === id ? { ...cinema, ...cinemaData } : cinema
      );
      localStorage.setItem('tickets.cinemas', JSON.stringify(updatedCinemas));
      return { cinemas: updatedCinemas };
    });
  },

  deleteCinema: (id) => {
    set((state) => {
      const updatedCinemas = state.cinemas.filter(cinema => cinema.id !== id);
      localStorage.setItem('tickets.cinemas', JSON.stringify(updatedCinemas));
      return { cinemas: updatedCinemas };
    });
  },

  toggleCinemaStatus: (id) => {
    set((state) => {
      const updatedCinemas = state.cinemas.map(cinema =>
        cinema.id === id ? { ...cinema, isActive: !cinema.isActive } : cinema
      );
      localStorage.setItem('tickets.cinemas', JSON.stringify(updatedCinemas));
      return { cinemas: updatedCinemas };
    });
  },

  // Room CRUD operations
  addRoom: (roomData) => {
    const newRoom: Room = {
      ...roomData,
      id: crypto.randomUUID(),
    };

    set((state) => {
      const updatedRooms = [...state.rooms, newRoom];
      localStorage.setItem('tickets.rooms', JSON.stringify(updatedRooms));
      return { rooms: updatedRooms };
    });
  },

  updateRoom: (id, roomData) => {
    set((state) => {
      const updatedRooms = state.rooms.map(room =>
        room.id === id ? { ...room, ...roomData } : room
      );
      localStorage.setItem('tickets.rooms', JSON.stringify(updatedRooms));
      return { rooms: updatedRooms };
    });
  },

  deleteRoom: (id) => {
    set((state) => {
      const updatedRooms = state.rooms.filter(room => room.id !== id);
      localStorage.setItem('tickets.rooms', JSON.stringify(updatedRooms));
      return { rooms: updatedRooms };
    });
  },

  // Session CRUD operations
  addSession: (sessionData) => {
    const newSession: Session = {
      ...sessionData,
      id: crypto.randomUUID(),
      isActive: true,
      occupiedSeats: [],
    };

    set((state) => {
      const updatedSessions = [...state.sessions, newSession];
      localStorage.setItem('tickets.sessions', JSON.stringify(updatedSessions));
      return { sessions: updatedSessions };
    });
  },

  updateSession: (id, sessionData) => {
    set((state) => {
      const updatedSessions = state.sessions.map(session =>
        session.id === id ? { ...session, ...sessionData } : session
      );
      localStorage.setItem('tickets.sessions', JSON.stringify(updatedSessions));
      return { sessions: updatedSessions };
    });
  },

  deleteSession: (id) => {
    set((state) => {
      const updatedSessions = state.sessions.filter(session => session.id !== id);
      localStorage.setItem('tickets.sessions', JSON.stringify(updatedSessions));
      return { sessions: updatedSessions };
    });
  },

  toggleSessionStatus: (id) => {
    set((state) => {
      const updatedSessions = state.sessions.map(session =>
        session.id === id ? { ...session, isActive: !session.isActive } : session
      );
      localStorage.setItem('tickets.sessions', JSON.stringify(updatedSessions));
      return { sessions: updatedSessions };
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