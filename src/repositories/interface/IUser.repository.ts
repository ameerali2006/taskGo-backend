
import { IUser } from "../../models/user.model";
import { IBaseRepository } from "./IBase.repository";

export interface IUserRepository
  extends IBaseRepository<IUser> {

  findByEmail(email: string): Promise<IUser | null>;

  findByPhone(phone: string): Promise<IUser | null>;

  updateRefreshToken(userId: string, refreshToken: string | null): Promise<IUser | null>;
}  