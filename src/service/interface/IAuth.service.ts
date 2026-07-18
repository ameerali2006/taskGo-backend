import { LoginUserDTO, RegisterUserDTO, AuthResponseDTO } from "../../dto/auth-user.dto";

export interface IAuthService {
  signup(data: RegisterUserDTO): Promise<AuthResponseDTO>;
  login(data: LoginUserDTO): Promise<AuthResponseDTO>;
  logout(userId: string): Promise<void>;
  refreshToken(token: string): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string }>;
  getProfile(userId: string): Promise<AuthResponseDTO>;
}