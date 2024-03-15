import { GameStatsDTO } from './GameStatsDTO';
import {ApiProperty} from "@nestjs/swagger";

export class UserDTO {
    @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
    username: string;

    @ApiProperty({ example: 1500, description: 'Elo rating of the user' })
    elo: number;

    @ApiProperty({ example: false, description: 'Whether the user has admin privileges' })
    isAdmin: boolean;

    @ApiProperty({ type: GameStatsDTO, description: 'Game statistics for the user' })
    gameStats: GameStatsDTO;

    constructor(username: string, elo: number, isAdmin: boolean, gameStats: GameStatsDTO) {
        this.username = username;
        this.elo = elo;
        this.isAdmin = isAdmin;
        this.gameStats = gameStats;
    }
}
