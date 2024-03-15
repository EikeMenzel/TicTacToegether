import {ApiProperty} from "@nestjs/swagger";

export class UsernameEloSymbolDTO {
    @ApiProperty({ description: 'Username of the user' })
    username: string;

    @ApiProperty({ description: 'Elo rating of the user' })
    elo: number;

    @ApiProperty({ description: 'Symbol associated with the user' })
    symbol: string;
    constructor(username: string, elo: number, symbol: string) {
        this.username = username;
        this.elo = elo;
        this.symbol = symbol;
    }
}
