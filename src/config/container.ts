import "reflect-metadata";
import { container } from "tsyringe";
import { IAuthController } from "../controllers/interface/IAuth.controller";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/User.repository";
import { JwtService } from "../service/jwt-auth.service";
import { AuthService } from "../service/auth.service";

// Register Singletons/Dependencies
container.registerSingleton(UserRepository);
container.registerSingleton(JwtService);
container.registerSingleton(AuthService);

// contoller
export const authController = container.resolve<IAuthController>(AuthController)



// service








// repository











export { container };