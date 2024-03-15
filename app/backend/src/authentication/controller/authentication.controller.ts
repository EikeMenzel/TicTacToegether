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
import { TokenResponseDTO } from '../payload/TokenResponseDTO';
import { UserService as UserServiceDatabase } from '../../database/services/user/user.service';
import { PasswordService } from '../services/password/password.service';
import { LoginDTO } from '../payload/LoginDTO';
import { Public } from '../decorators/Public';
import { ValidationExceptionFilter } from '../filters/validation-exception/validation-exception.filter';
import { JwtHelperService } from '../services/jwt-helper/jwt-helper.service';
import {UserEloRatingService as UserEloRatingServiceDatabase } from "../../database/services/user-elo-rating/user-elo-rating.service";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse, ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {ApiPublicOperation} from "../../custom-swagger-annotations/ApiPublicOperation";

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

    @Public()
    @ApiPublicOperation('Register a new user')
    @ApiBody({ type: RegisterDTO })
    @ApiCreatedResponse({
        description: 'User registered successfully',
        type: TokenResponseDTO,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
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

        return new TokenResponseDTO(await this.jwtHelper.generateJWTToken(user.id));
    }

    @Public()
    @ApiPublicOperation('Login a user')
    @ApiBody({ type: LoginDTO })
    @ApiOkResponse({
        description: 'User logged in successfully',
        type: TokenResponseDTO,
    })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDTO: LoginDTO): Promise<{ access_token: string }> {
        const user = await this.userServiceDatabase.findUserByUsername(loginDTO.username);
        if (!user || !(await this.passwordService.arePasswordsEqual(loginDTO.password, user.password))) throw new UnauthorizedException();

        return new TokenResponseDTO(await this.jwtHelper.generateJWTToken(user.id));
    }
}
