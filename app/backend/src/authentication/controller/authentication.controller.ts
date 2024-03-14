import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Post,
    UnauthorizedException,
    UseFilters,
} from '@nestjs/common';
import { RegisterDTO } from '../payload/RegisterDTO';
import { UserService as UserServiceDatabase } from '../../database/services/user/user.service';
import { PasswordService } from '../services/password/password.service';
import { LoginDTO } from '../payload/LoginDTO';
import { Public } from '../decorators/Public';
import { ValidationExceptionFilter } from '../filters/validation-exception/validation-exception.filter';
import { JwtHelperService } from '../services/jwt-helper/jwt-helper.service';
import {UserEloRatingService as UserEloRatingServiceDatabase } from "../../database/services/user-elo-rating/user-elo-rating.service";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('Authentication')
@Controller('api/v1')
@UseFilters(ValidationExceptionFilter)
export class AuthenticationController {
    constructor(
        private userServiceDatabase: UserServiceDatabase,
        private userEloServiceDatabase: UserEloRatingServiceDatabase,
        private passwordService: PasswordService,
        private jwtHelper: JwtHelperService
    ) {}

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() registerDTO: RegisterDTO): Promise<{ access_token: string }> {
        if ((await this.userServiceDatabase.findUserByUsername(registerDTO.username)) !== null)
            throw new BadRequestException({
                message: ['username: Username already exists'],
            });

        if (!this.passwordService.checkPasswordSecurity(registerDTO.password)) {
            throw new BadRequestException({
                message: [
                    'password: Please make sure you are using at least 1x digit, 1x capitalized and 1x lower-case letter and at least 1x symbol from the following pool: ~`! @#$%^&*()_-+={[}]|:;<,>.?/',
                ],
            });
        }

        const user = await this.userServiceDatabase.saveUser(registerDTO.username, await this.passwordService.hashPassword(registerDTO.password));
        if (!user) throw new InternalServerErrorException('user could not be created');

        await this.userEloServiceDatabase.saveUserEloRating(user.id, 1000); // init value for each user

        return {
            access_token: await this.jwtHelper.generateJWTToken(user.id),
        };
    }

    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged in successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDTO: LoginDTO): Promise<{ access_token: string }> {
        const user = await this.userServiceDatabase.findUserByUsername(loginDTO.username);
        if (!user || !(await this.passwordService.arePasswordsEqual(loginDTO.password, user.password))) throw new UnauthorizedException();

        return {
            access_token: await this.jwtHelper.generateJWTToken(user.id),
        };
    }
}
