import { IsString, Length } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UpdatePasswordDTO {
    @ApiProperty({
        description: 'The new password',
        minLength: 8,
        maxLength: 72,
        example: 'NewStrongPassword1!',
    })
    @IsString({ message: 'password: Password must be a string' })
    @Length(8, 72, {
        message: 'password: Password must be between 8 and 72 characters long',
    })
    newPassword: string;
}
