import {ApiProperty} from "@nestjs/swagger";

export class UsernameEloDTO {
    @ApiProperty({ example: 'jane_doe', description: 'Username of the user' })
    username: string;

    @ApiProperty({ example: 1400, description: 'Elo rating of the user' })
    elo: number;

    constructor(username: string, elo: number) {
        this.username = username;
        this.elo = elo;
    }
}
