import {ApiProperty} from "@nestjs/swagger";

/**
 * A DTO (Data Transfer Object) that represents a username and their Elo rating.
 */
export class UsernameEloDTO {
  /**
   * The username of the user.
   */
  @ApiProperty({
    example: 'jane_doe',
    description: 'Username of the user',
  })
  username: string;

  /**
   * The Elo rating of the user.
   */
  @ApiProperty({
    example: 1400,
    description: 'Elo rating of the user',
  })
  elo: number;

  /**
   * Creates a new instance of the `UsernameEloDTO` class.
   *
   * @param username - The username of the user.
   * @param elo - The Elo rating of the user.
   */
  constructor(username: string, elo: number) {
    this.username = username;
    this.elo = elo;
  }
}
