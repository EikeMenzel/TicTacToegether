import {ApiProperty} from "@nestjs/swagger";

export class TokenResponseDTO {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'The JWT token',
    })
    access_token: string;


    constructor(access_token: string) {
        this.access_token = access_token;
    }
}
