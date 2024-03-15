import {UsernameEloDTO} from "./UsernameEloDTO";
import {ApiProperty} from "@nestjs/swagger";

export class AdminQueueItemDTO {
    @ApiProperty({
        description: 'User information with username and Elo rating',
        type: () => UsernameEloDTO
    })
    user: UsernameEloDTO;

    @ApiProperty({
        description: 'Bucket number where the user is in the matchmaking queue'
    })
    bucket: number;
    constructor(user: UsernameEloDTO, bucket: number) {
        this.user = user;
        this.bucket = bucket;
    }
}
