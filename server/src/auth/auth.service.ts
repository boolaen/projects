
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            this.logger.debug('Login attempt: user not found');
            return null;
        }

        if (await bcrypt.compare(pass, user.passwordHash)) {
            if (user.isBanned) {
                this.logger.debug('Login attempt: user is banned');
                return null;
            }
            const { passwordHash, ...result } = user;
            return result;
        }
        this.logger.debug('Login attempt: password mismatch');
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                avatarUrl: user.avatarUrl,
            }
        };
    }

    async register(user: any) {
        return this.usersService.create(user);
    }
}
