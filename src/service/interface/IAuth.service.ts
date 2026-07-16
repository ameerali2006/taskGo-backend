import { LoginUserDTO, RegisterUserDTO, AuthResponseDTO } from "../../dto/auth-user.dto";

export interface IAuthService {
  register(data: RegisterUserDTO): Promise<AuthResponseDTO>;
  login(data: LoginUserDTO): Promise<AuthResponseDTO>;
}