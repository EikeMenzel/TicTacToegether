import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtKey } from '../../constants';

@Injectable()
export class JwtHelperService {
    constructor(private jwtService: JwtService) {}

    async generateJWTToken(userId: number): Promise<string> {
        return await this.jwtService.signAsync({ userId: userId });
    }

    async verifyJWTToken(token: string): Promise<any> {
        return await this.jwtService.verifyAsync(token, {
            secret: jwtKey.secret,
        });
    }
}