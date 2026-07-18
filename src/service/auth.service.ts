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

  async signup(data: RegisterUserDTO): Promise<AuthResponseDTO & { refreshToken?: string }> {
    // 1. Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      return {
        success: false,
        message: "Email already registered",
      };
    }

    // 2. Check if phone already exists
    const existingPhone = await this.userRepository.findByPhone(data.phone);
    if (existingPhone) {
      return {
        success: false,
        message: "Phone number already registered",
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

    // 5. Generate Access & Refresh Tokens
    const accessToken = this.jwtService.generateAccessToken(newUser._id.toString(), "user");
    const refreshToken = this.jwtService.generateRefreshToken(newUser._id.toString(), "user");

    // 6. Save Refresh Token in Database
    await this.userRepository.updateRefreshToken(newUser._id.toString(), refreshToken);

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
      refreshToken,
    } as any;
  }

  async login(data: LoginUserDTO): Promise<AuthResponseDTO & { refreshToken?: string }> {
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

    // 3. Generate Access & Refresh Tokens
    const accessToken = this.jwtService.generateAccessToken(user._id.toString(), "user");
    const refreshToken = this.jwtService.generateRefreshToken(user._id.toString(), "user");

    // 4. Update Refresh Token in Database
    await this.userRepository.updateRefreshToken(user._id.toString(), refreshToken);

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
      refreshToken,
    } as any;
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  async refreshToken(token: string): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string }> {
    const payload = this.jwtService.verifyToken(token, "refresh");
    if (!payload || !payload._id) {
      return {
        success: false,
        message: "Invalid or expired refresh token",
      };
    }

    const user = await this.userRepository.findById(payload._id);
    if (!user || user.refreshToken !== token) {
      return {
        success: false,
        message: "Refresh token revoked or invalid",
      };
    }

    const accessToken = this.jwtService.generateAccessToken(user._id.toString(), "user");
    const newRefreshToken = this.jwtService.generateRefreshToken(user._id.toString(), "user");

    await this.userRepository.updateRefreshToken(user._id.toString(), newRefreshToken);

    return {
      success: true,
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getProfile(userId: string): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }
    return {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }
}
