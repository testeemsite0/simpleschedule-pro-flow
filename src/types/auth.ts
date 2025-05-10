
import { Professional } from "./index";

export interface AuthContextType {
  user: Professional | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, profession: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthState {
  user: Professional | null;
  isLoading: boolean;
}
