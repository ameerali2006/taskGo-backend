import { injectable, inject } from "tsyringe";
import bcrypt from "bcrypt";
import { IAuthService } from "./interface/IAuth.service";
import { RegisterUserDTO, LoginUserDTO, AuthResponseDTO } from "../dto/auth-user.dto";
import { UserRepository } from "../repositories/User.repository";
import { JwtService } from "./jwt-auth.service";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
    @inject(JwtService)
    private readonly jwtService: JwtService
  ) {}

  async register(data: RegisterUserDTO): Promise<AuthResponseDTO> {
    // 1. Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      return {
        success: false,
        message: "User already exists",
      };
    }

    // 2. Check if phone already exists
    const existingPhone = await this.userRepository.findByPhone(data.phone);
    if (existingPhone) {
      return {
        success: false,
        message: "Phone number already exists",
      };
    }

    // 3. Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4. Create the user
    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
    });

    // 5. Generate JWT Access Token
    // We pass role: 'user' because jwtService requires a role.
    const accessToken = this.jwtService.generateAccessToken(newUser._id.toString(), "user");

    return {
      success: true,
      message: "Registration successful",
      data: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
      accessToken,
    };
  }

  async login(data: LoginUserDTO): Promise<AuthResponseDTO> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // 2. Compare password
    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // 3. Generate JWT Access Token
    const accessToken = this.jwtService.generateAccessToken(user._id.toString(), "user");

    return {
      success: true,
      message: "Login successful",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      accessToken,
    };
  }
}
