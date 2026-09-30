export type Role = '마스터' | '관리자' | '일반회원' | '탈퇴회원';
export type GameStatus = '대여가능' | '대여중';

export interface UserData {
  userId: string;
  name: string;
  email: string;
  role: Role;
  passwordHash?: string;
  penaltyPoints: number;
  penaltyEndDate?: string | null;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Game {
  gameId: string;
  title: string;
  status: GameStatus;
  minPlayers: number;
  maxPlayers: number;
  playTime: number;
  difficulty: number;
  imageUrl: string;
  description?: string;
  isVisible: 'Y' | 'N';
  genres: string[];
  createdAt: string;
  releaseYear: number;
  bggRating: number;
  rentalCount?: number;
  recentRentalCount?: number;
}

export interface Rental {
  rentalId: number;
  userId: string;
  gameId: string;
  gameTitle: string;
  status: '대여중' | '반납완료';
  startDate: string;
  endDate: string;
  returnedAt?: string | null;
}

export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface ReportData {
  reportId: number;
  userId: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface BoardSite {
  siteId: number;
  name: string;
  url: string;
  bannerUrl?: string;
  description?: string;
  isVisible: 'Y' | 'N';
}

export interface UserRating {
  userId: string;
  gameId: string;
  score: number;
}