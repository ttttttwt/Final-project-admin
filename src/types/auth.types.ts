export interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
  avatarUrl?: string;
  authProvider?: string;
  currentLevel?: string;
  learningGoal?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  tokenType?: string;
  expiresIn?: number;
}

export interface LoginResponse extends AuthResponse {}
