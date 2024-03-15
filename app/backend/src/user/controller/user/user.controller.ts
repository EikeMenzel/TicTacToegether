import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Put,
    Req,
    Request,
    Res,
    UnsupportedMediaTypeException,
    UploadedFile,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UserDTO } from '../../payload/UserDTO';
import { UserService } from '../../services/user/user.service';
import { UpdateUsernameDTO } from '../../payload/UpdateUsernameDTO';
import { UserEntity } from '../../../database/models/UserEntity';
import { IsAdminGuard } from '../../guard/is-admin/is-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UtilsService } from '../../services/utils/utils.service';
import { ValidationExceptionFilter } from '../../../authentication/filters/validation-exception/validation-exception.filter';
import { PasswordService } from '../../../authentication/services/password/password.service';
import { UpdatePasswordDTO } from '../../payload/UpdatePasswordDTO';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiNoContentResponse,
    ApiForbiddenResponse,
    ApiUnsupportedMediaTypeResponse
} from '@nestjs/swagger';
import {GameHistoryDTO} from "../../payload/GameHistoryDTO";
import {UsernameEloDTO} from "../../../tictactoe/payload/UsernameEloDTO";
import {AdminApiOperation} from "../../../custom-swagger-annotations/ApiAdminOperation";

@ApiTags('User Profiles')
@ApiBearerAuth()
@Controller('api/v1/profiles')
@UseFilters(ValidationExceptionFilter)
export class UserController {
    constructor(
        private userService: UserService,
        private utilsService: UtilsService,
        private passwordService: PasswordService
    ) {}

    @ApiOperation({ summary: 'Get own profile' })
    @ApiOkResponse({ type: UserDTO, description: 'Profile retrieved successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Get('own')
    @HttpCode(HttpStatus.OK)
    async getOwnProfile(@Request() req): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUserIdToUserDTO(await this.getUserIdFromPromise(req));
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    @ApiOperation({ summary: 'Update own username' })
    @ApiNoContentResponse({ description: 'Username updated successfully' })
    @ApiBadRequestResponse({ description: 'Username already exists' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiBody({ type: UpdateUsernameDTO })
    @Put('own')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOwnProfileUsername(@Request() req, @Body() updateUsernameDTO: UpdateUsernameDTO): Promise<void> {
        if (await this.userService.doesUserNameExist(updateUsernameDTO.username))
            throw new BadRequestException({
                message: ['username: Username already exists'],
            });

        const result: UserEntity | undefined = await this.userService.updateUserName(await this.getUserIdFromPromise(req), updateUsernameDTO.username);
        if (!result) {
            throw new NotFoundException();
        }
    }

    @AdminApiOperation('Get user profile by username', 'Retrieves the profile for a specific user by their username.')
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiOkResponse({ description: 'Profile retrieved successfully', type: UserDTO })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiForbiddenResponse({ description: 'You are not allowed to query this route!' })
    @Get(':username')
    @HttpCode(HttpStatus.OK)
    @UseGuards(IsAdminGuard)
    async getProfile(@Param('username') username: string): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUsernameToUserDTO(username);
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    @ApiOperation({ summary: 'Upload user image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiNoContentResponse({ description: 'Image uploaded successfully' })
    @ApiUnsupportedMediaTypeResponse({ description: 'Unsupported media type' })
    @Put('own/image')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<void> {
        if (!this.utilsService.getImageFormat(file.buffer)) {
            throw new UnsupportedMediaTypeException();
        }

        const user = await this.userService.saveImage(await this.getUserIdFromPromise(req), file);
        if (user === undefined || user.image === undefined) throw new InternalServerErrorException();
    }

    @ApiOperation({ summary: 'Get user image by username' })
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiOkResponse({ description: 'Image retrieved successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Get(':username/image')
    async getImageByUsername(@Param('username') username: string, @Res() res): Promise<void> {
        const image: Buffer = await this.userService.getImageByUsername(username);
        if (!image) {
            throw new NotFoundException();
        }

        const imageFormat = this.utilsService.getImageFormat(image);
        if (!imageFormat) {
            throw new UnsupportedMediaTypeException();
        }

        res.type(imageFormat);
        res.send(image);
    }

    @ApiOperation({ summary: 'Update user password' })
    @ApiBody({ type: UpdatePasswordDTO })
    @ApiNoContentResponse({ description: 'Password updated successfully' })
    @ApiBadRequestResponse({ description: 'Password does not meet security requirements' })
    @Put('own/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePassword(@Req() req, @Body() updatePasswordDTO: UpdatePasswordDTO) {
        if (!this.passwordService.checkPasswordSecurity(updatePasswordDTO.newPassword)) {
            throw new BadRequestException({
                message: [
                    'password: Please make sure you are using at least 1x digit, 1x capitalized and 1x lower-case letter and at least 1x symbol from the following pool: ~`! @#$%^&*()_-+={[}]|:;<,>.?/',
                ],
            });
        }

        const user = await this.userService.updateUserPassword(
            await this.getUserIdFromPromise(req),
            await this.passwordService.hashPassword(updatePasswordDTO.newPassword)
        );
        if (!user) throw new InternalServerErrorException('user could not be created');
    }

    @ApiOperation({ summary: 'Get own game history' })
    @ApiOkResponse({ description: 'Game history retrieved successfully', type: GameHistoryDTO, isArray: true })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Get('own/history')
    async getOwnHistory(@Req() req) {
        const userId = await this.getUserIdFromPromise(req);
        if (!userId) throw new NotFoundException();

        return await this.userService.getGameHistoryById(userId);
    }

    @AdminApiOperation('Get game history by username', 'Retrieves the game history for a specific user by their username.')
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiOkResponse({ description: 'Game history retrieved successfully', type: GameHistoryDTO, isArray: true })
    @ApiForbiddenResponse({ description: 'You are not allowed to query this route!' })
    @Get(':username/history')
    @UseGuards(IsAdminGuard)
    async getHistoryById(@Param('username') username: string) {
        return await this.userService.getGameHistoryByUsername(username);
    }

    @AdminApiOperation('Get all users', 'Retrieves all users along with their Elo rating.')
    @ApiOkResponse({ description: 'Users retrieved successfully', type: [UsernameEloDTO], isArray: true })
    @UseGuards(IsAdminGuard)
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    private async getUserIdFromPromise(@Req() req): Promise<number> {
        return (await (req.user instanceof Promise ? req.user : Promise.resolve(req.user))).userId;
    }
}
