export interface RegisterUserDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}
export interface LoginUserDTO {
  email: string;
  password: string;
}
export interface AuthResponseDTO {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  accessToken?: string;
}