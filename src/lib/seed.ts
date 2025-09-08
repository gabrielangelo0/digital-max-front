import { Movie, Cinema, Session, Room, User } from '@/types';

// Import das imagens dos filmes
import moviePoster1 from '@/assets/movie-poster-1.jpg';
import moviePoster2 from '@/assets/movie-poster-2.jpg';
import moviePoster3 from '@/assets/movie-poster-3.jpg';

const SEED_VERSION = '1.1.0'; // Atualizada versão para recriar dados

// Usuários de demonstração
const seedUsers: User[] = [
  {
    id: '1',
    name: 'Cliente Demo',
    email: 'user@demo.com',
    password: '123456',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    password: '123456',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

// Filmes em cartaz
const seedMovies: Movie[] = [
  {
    id: '1',
    title: 'O Agente Sombrio',
    synopsis: 'Um ex-agente da CIA é forçado a sair da clandestinidade quando descobertas do seu passado o colocam na mira de assassinos implacáveis.',
    posterUrl: moviePoster1,
    trailerUrl: 'https://www.youtube.com/embed/BmllggGO4pM',
    genre: 'Ação',
    duration: 125,
    ageRating: 14,
    releaseDate: '2024-01-15',
    isActive: true,
  },
  {
    id: '2', 
    title: 'Amores de Inverno',
    synopsis: 'Uma história tocante sobre segundas chances e o poder transformador do amor verdadeiro em meio às dificuldades da vida.',
    posterUrl: moviePoster2,
    trailerUrl: 'https://www.youtube.com/embed/example2',
    genre: 'Romance',
    duration: 108,
    ageRating: 12,
    releaseDate: '2024-02-10',
    isActive: true,
  },
  {
    id: '3',
    title: 'Galáxia 9',
    synopsis: 'A épica jornada de uma tripulação espacial que descobre uma civilização alienígena avançada nas profundezas do cosmos.',
    posterUrl: moviePoster3,
    trailerUrl: 'https://www.youtube.com/embed/example3',
    genre: 'Ficção Científica',
    duration: 140,
    ageRating: 10,
    releaseDate: '2024-03-05',
    isActive: true,
  },
  {
    id: '4',
    title: 'Risadas Garantidas',
    synopsis: 'Uma comédia hilariante sobre um grupo de amigos que se reencontram após 20 anos para uma aventura inesquecível.',
    posterUrl: 'https://images.unsplash.com/photo-1489599904472-26651c7d4f17?w=400&h=600&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/embed/example4',
    genre: 'Comédia',
    duration: 95,
    ageRating: 12,
    releaseDate: '2024-01-20',
    isActive: true,
  },
  {
    id: '5',
    title: 'Noite de Terror',
    synopsis: 'Um thriller psicológico que mantém o público na beira do assento com reviravoltas inesperadas e sustos de arrepiar.',
    posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/embed/example5',
    genre: 'Terror',
    duration: 110,
    ageRating: 16,
    releaseDate: '2024-02-28',
    isActive: true,
  },
  {
    id: '6',
    title: 'Pequenos Heróis',
    synopsis: 'Uma animação encantadora sobre um grupo de crianças que descobrem poderes especiais e precisam salvar sua cidade.',
    posterUrl: 'https://images.unsplash.com/photo-1594736797933-d0ac8cb2837e?w=400&h=600&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/embed/example6',
    genre: 'Animação',
    duration: 85,
    ageRating: 0,
    releaseDate: '2024-03-15',
    isActive: true,
  },
];

// Cinemas por cidade
const seedCinemas: Cinema[] = [
  // São Paulo
  {
    id: '1',
    name: 'CineMax Shopping Ibirapuera',
    city: 'São Paulo',
    address: 'Av. Ibirapuera, 3103 - Ibirapuera',
    isActive: true,
  },
  {
    id: '2',
    name: 'CineMax Shopping Eldorado',
    city: 'São Paulo',
    address: 'Av. Rebouças, 3970 - Pinheiros',
    isActive: true,
  },
  {
    id: '3',
    name: 'CineMax Morumbi',
    city: 'São Paulo',
    address: 'Av. das Nações Unidas, 14401 - Vila Gertrudes',
    isActive: true,
  },
  // Rio de Janeiro
  {
    id: '4',
    name: 'CineMax Barra Shopping',
    city: 'Rio de Janeiro',
    address: 'Av. das Américas, 4666 - Barra da Tijuca',
    isActive: true,
  },
  {
    id: '5',
    name: 'CineMax Copacabana',
    city: 'Rio de Janeiro',
    address: 'Av. Nossa Senhora de Copacabana, 581 - Copacabana',
    isActive: true,
  },
  // Fortaleza
  {
    id: '6',
    name: 'CineMax Iguatemi Fortaleza',
    city: 'Fortaleza',
    address: 'Av. Washington Soares, 85 - Edson Queiroz',
    isActive: true,
  },
  {
    id: '7',
    name: 'CineMax RioMar Fortaleza',
    city: 'Fortaleza',
    address: 'Rua Desembargador Lauro Nogueira, 1500 - Papicu',
    isActive: true,
  },
];

// Salas por cinema
const seedRooms: Room[] = [
  // São Paulo - Cinema 1
  { id: '1', cinemaId: '1', name: 'Sala 1', type: '2D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '2', cinemaId: '1', name: 'Sala 2', type: '3D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '3', cinemaId: '1', name: 'Sala IMAX', type: 'IMAX', rows: 12, columns: 14, totalSeats: 168, accessibleSeats: ['A1', 'A2', 'A3'] },
  // São Paulo - Cinema 2
  { id: '4', cinemaId: '2', name: 'Sala 1', type: '2D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '5', cinemaId: '2', name: 'Sala 2', type: '3D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '6', cinemaId: '2', name: 'Sala VIP', type: 'VIP', rows: 8, columns: 10, totalSeats: 80, accessibleSeats: ['A1', 'A2'] },
  // São Paulo - Cinema 3
  { id: '7', cinemaId: '3', name: 'Sala 1', type: '2D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '8', cinemaId: '3', name: 'Sala 2', type: '3D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  // Rio de Janeiro - Cinema 4
  { id: '9', cinemaId: '4', name: 'Sala 1', type: '2D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '10', cinemaId: '4', name: 'Sala IMAX', type: 'IMAX', rows: 12, columns: 14, totalSeats: 168, accessibleSeats: ['A1', 'A2', 'A3'] },
  // Rio de Janeiro - Cinema 5
  { id: '11', cinemaId: '5', name: 'Sala 1', type: '2D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '12', cinemaId: '5', name: 'Sala 2', type: '3D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  // Fortaleza - Cinema 6
  { id: '13', cinemaId: '6', name: 'Sala 1', type: '2D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '14', cinemaId: '6', name: 'Sala 2', type: '3D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  // Fortaleza - Cinema 7
  { id: '15', cinemaId: '7', name: 'Sala 1', type: '2D', rows: 10, columns: 12, totalSeats: 120, accessibleSeats: ['A1', 'A2'] },
  { id: '16', cinemaId: '7', name: 'Sala VIP', type: 'VIP', rows: 8, columns: 10, totalSeats: 80, accessibleSeats: ['A1', 'A2'] },
];

// Função para gerar assentos ocupados aleatórios
const generateRandomOccupiedSeats = (room: Room): string[] => {
  const seats: string[] = [];
  const occupiedCount = Math.floor(room.totalSeats * 0.1); // 10% ocupados
  
  for (let i = 0; i < occupiedCount; i++) {
    const row = String.fromCharCode(65 + Math.floor(Math.random() * room.rows)); // A-J
    const number = Math.floor(Math.random() * room.columns) + 1;
    const seatId = `${row}${number}`;
    
    if (!seats.includes(seatId)) {
      seats.push(seatId);
    }
  }
  
  return seats;
};

// Gerar sessões para os próximos 7 dias
const generateSessions = (): Session[] => {
  const sessions: Session[] = [];
  let sessionId = 1;
  
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Horários padrão
    const times = ['14:20', '17:00', '20:10', '22:30'];
    
    seedMovies.forEach(movie => {
      seedRooms.forEach(room => {
        times.forEach((time, timeIndex) => {
          // Nem todos os filmes em todas as salas em todos os horários
          if (Math.random() > 0.3) { // 70% de chance de ter sessão
            const basePrice = room.type === 'IMAX' ? 45 : room.type === 'VIP' ? 55 : room.type === '3D' ? 35 : 30;
            
            sessions.push({
              id: sessionId.toString(),
              movieId: movie.id,
              cinemaId: room.cinemaId,
              roomId: room.id,
              date: dateStr,
              time,
              basePrice,
              occupiedSeats: generateRandomOccupiedSeats(room),
              isActive: true,
            });
            
            sessionId++;
          }
        });
      });
    });
  }
  
  return sessions;
};

export const initializeSeedData = () => {
  const currentVersion = localStorage.getItem('tickets.seedVersion');
  
  if (currentVersion !== SEED_VERSION) {
    console.log('Inicializando dados seed do CineMax...');
    
    // Limpar dados existentes
    localStorage.removeItem('tickets.users');
    localStorage.removeItem('tickets.movies');
    localStorage.removeItem('tickets.cinemas');
    localStorage.removeItem('tickets.rooms');
    localStorage.removeItem('tickets.sessions');
    localStorage.removeItem('tickets.orders');
    
    // Gerar sessões
    const sessions = generateSessions();
    
    // Salvar dados
    localStorage.setItem('tickets.users', JSON.stringify(seedUsers));
    localStorage.setItem('tickets.movies', JSON.stringify(seedMovies));
    localStorage.setItem('tickets.cinemas', JSON.stringify(seedCinemas));
    localStorage.setItem('tickets.rooms', JSON.stringify(seedRooms));
    localStorage.setItem('tickets.sessions', JSON.stringify(sessions));
    localStorage.setItem('tickets.orders', JSON.stringify([]));
    localStorage.setItem('tickets.seedVersion', SEED_VERSION);
    
    console.log(`Seed concluído: ${seedMovies.length} filmes, ${seedCinemas.length} cinemas, ${sessions.length} sessões`);
  }
};