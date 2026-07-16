"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.authController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
const auth_controller_1 = require("../controllers/auth.controller");
const User_repository_1 = require("../repositories/User.repository");
const jwt_auth_service_1 = require("../service/jwt-auth.service");
const auth_service_1 = require("../service/auth.service");
// Register Singletons/Dependencies
tsyringe_1.container.registerSingleton(User_repository_1.UserRepository);
tsyringe_1.container.registerSingleton(jwt_auth_service_1.JwtService);
tsyringe_1.container.registerSingleton(auth_service_1.AuthService);
// contoller
exports.authController = tsyringe_1.container.resolve(auth_controller_1.AuthController);
