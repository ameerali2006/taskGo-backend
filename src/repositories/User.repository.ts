import { injectable } from "tsyringe";


import { IUser, UserModel } from "../models/user.model";
import { BaseRepository } from "./Base.repostiory";
import { IUserRepository } from "./interface/IUser.repository";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository {

  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email });
  }

  async findByPhone(phone: string) {
    return this.model.findOne({ phone });
  }
}