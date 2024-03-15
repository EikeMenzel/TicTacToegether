import {UsernameEloSymbolDTO} from "./UsernameEloSymbolDTO";
import {ApiProperty} from "@nestjs/swagger";

export class AdminGameItemDTO {
    @ApiProperty({
        description: 'User 1 information with username, Elo rating, and symbol',
        type: () => UsernameEloSymbolDTO
    })
    user1: UsernameEloSymbolDTO;

    @ApiProperty({
        description: 'User 2 information with username, Elo rating, and symbol',
        type: () => UsernameEloSymbolDTO
    })
    user2: UsernameEloSymbolDTO;

    @ApiProperty({
        description: 'User who started the game information with username, Elo rating, and symbol',
        type: () => UsernameEloSymbolDTO
    })
    playerThatStarted: UsernameEloSymbolDTO;

    @ApiProperty({
        description: 'Game ID',
        example: '4b348527-a341-4fd6-9ba8-0bafb947f2ea'
    })
    gameId: string;

    constructor(user1: UsernameEloSymbolDTO, user2: UsernameEloSymbolDTO, playerThatStarted: UsernameEloSymbolDTO, gameId: string) {
        this.user1 = user1;
        this.user2 = user2;
        this.playerThatStarted = playerThatStarted;
        this.gameId = gameId;
    }
}
