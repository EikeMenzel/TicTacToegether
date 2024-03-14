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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiTags('User Profiles')
@Controller('api/v1/profiles')
@UseFilters(ValidationExceptionFilter)
export class UserController {
    constructor(
        private userService: UserService,
        private utilsService: UtilsService,
        private passwordService: PasswordService
    ) {}

    @ApiOperation({ summary: 'Get own profile' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Profile retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
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
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Username updated successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Username already exists' })
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

    @ApiOperation({ summary: 'Get user profile by username' })
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Profile retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You are not allowed to query this route!' })
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
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Image uploaded successfully' })
    @ApiResponse({ status: HttpStatus.UNSUPPORTED_MEDIA_TYPE, description: 'Unsupported media type' })
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
    @ApiResponse({ status: HttpStatus.OK, description: 'Image retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
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
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Password updated successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Password does not meet security requirements' })
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
    @ApiResponse({ status: HttpStatus.OK, description: 'Game history retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    @Get('own/history')
    async getOwnHistory(@Req() req) {
        const userId = await this.getUserIdFromPromise(req);
        if (!userId) throw new NotFoundException();

        return await this.userService.getGameHistoryById(userId);
    }

    @ApiOperation({ summary: 'Get game history by username' })
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game history retrieved successfully' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You are not allowed to query this route!' })
    @Get(':username/history')
    @UseGuards(IsAdminGuard)
    async getHistoryById(@Param('username') username: string) {
        return await this.userService.getGameHistoryByUsername(username);
    }

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
    @Get()
    @UseGuards(IsAdminGuard)
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    private async getUserIdFromPromise(@Req() req): Promise<number> {
        return (await (req.user instanceof Promise ? req.user : Promise.resolve(req.user))).userId;
    }
}
