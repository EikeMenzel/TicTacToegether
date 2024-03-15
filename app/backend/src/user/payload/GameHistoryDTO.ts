import {ApiProperty} from "@nestjs/swagger";

export class GameHistoryDTO {
    @ApiProperty({
        example: new Date().toISOString(),
        description: 'Timestamp of the game',
        type: 'string',
        format: 'date-time'
    })
    timestamp: Date;

    @ApiProperty({
        example: 1200,
        description: 'Elo rating of the user at the time of the game'
    })
    ownEloAtTimestamp: number;

    @ApiProperty({
        example: 1250,
        description: 'Elo rating of the opponent at the time of the game'
    })
    opponentEloAtTimestamp: number;

    @ApiProperty({
        example: 'opponent_user',
        description: 'Username of the opponent'
    })
    opponentName: string;

    @ApiProperty({
        example: 'user',
        description: 'Username of the winner'
    })
    winner: string;

    constructor(timestamp: Date, ownEloAtTimestamp: number, opponentEloAtTimestamp: number, opponentName: string, winner: string) {
        this.timestamp = timestamp;
        this.ownEloAtTimestamp = ownEloAtTimestamp;
        this.opponentEloAtTimestamp = opponentEloAtTimestamp;
        this.opponentName = opponentName;
        this.winner = winner;
    }
}
