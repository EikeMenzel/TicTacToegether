import { IsString, Length } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUsernameDTO {
    @ApiProperty({
        description: 'The new username',
        minLength: 6,
        maxLength: 64,
        example: 'new_username',
    })
    @IsString({ message: 'Username must be a string' })
    @Length(6, 64, {
        message: 'Username must be between 6 and 64 characters long',
    })
    username: string;
}
