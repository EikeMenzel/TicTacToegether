import { IsString, Length } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class RegisterDTO {
    @ApiProperty({
        description: 'The username of the user',
        minLength: 6,
        maxLength: 64,
        example: 'john_doe',
    })
    @IsString({ message: 'username: Username must be a string' })
    @Length(6, 64, {
        message: 'username: Username must be between 6 and 64 characters long',
    })
    username: string;

    @ApiProperty({
        description: 'The password of the user',
        minLength: 8,
        maxLength: 72,
        example: 'strongPassword123!',
    })
    @IsString({ message: 'password: Password must be a string' })
    @Length(8, 72, {
        message: 'password: Password must be between 8 and 72 characters long',
    })
    password: string;
}
