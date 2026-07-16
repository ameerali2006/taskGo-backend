import {  TokenPayload } from "../jwt-auth.service";


export interface IJwtService {
  generateAccessToken(_id: string, role:'user'|'admin'|'worker'): string;
  generateRefreshToken(_id: string, role:'user'|'admin'|'worker'): string;
  verifyToken(token: string, type: 'access' | 'refresh'): TokenPayload | null;
  

}