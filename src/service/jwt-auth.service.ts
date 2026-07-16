import { injectable } from 'tsyringe';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ms from 'ms';
import { IJwtService } from './interface/IJwt-auth.service.interface';



export interface ResetTokenPayload extends JwtPayload {
	email: string;
}
export interface TokenPayload extends JwtPayload {
  _id?: string;
  userId?: string;
  email?: string;
  role?: 'user' | 'admin' | 'worker';
}
@injectable()
export class JwtService implements IJwtService {
  generateAccessToken(_id:string, role:'user'|'admin'|'worker'):string {
    return jwt.sign({ _id, role }, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
    });
  }

  generateRefreshToken(_id:string, role:'user'|'admin'|'worker'):string {
    return jwt.sign({ _id, role }, process.env.REFRESH_TOKEN_SECRET as string, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
    });
  }

  verifyToken(token:string, type:'access'|'refresh'): TokenPayload | null {
    const secret = type === 'access' ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;
    try {
      return jwt.verify(token, secret as string) as TokenPayload;
    } catch (error) {
      console.error('error on jwt :', error);
      return null;
    }
  }

  
}