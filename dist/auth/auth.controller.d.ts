import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, authLoginDto: AuthLoginDto): Promise<{
        access_token: string;
    }>;
}
