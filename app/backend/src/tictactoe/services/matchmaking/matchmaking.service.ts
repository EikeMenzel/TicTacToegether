import { Injectable } from '@nestjs/common';
import { Mutex } from 'async-mutex';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameService } from '../game/game.service';
import { GameUserInfo } from '../../model/GameUserInfo';
import { EGameSymbol } from '../../model/EGameSymbol';

@Injectable()
export class MatchmakingService {
    private users = new Map<number, { elo: number; socketId: string }>();
    private eloBuckets = new Map<number, Set<number>>();
    private bucketSize: number = 200;
    private mutex = new Mutex();

    constructor(
        private eventEmitter: EventEmitter2,
        private gameService: GameService
    ) {}

    async enqueueUser(userId: number, elo: number, socketId: string): Promise<boolean> {
        const release = await this.mutex.acquire();
        try {
            if (await this.isUserInQueueOrGame(userId)) {
                console.error(`User is already in a game or queue ${userId}`);
                release();
                return false;
            }

            await this.addUserToQueue(userId, { elo, socketId });
            await this.checkForMatches(userId, elo);

            this.eventEmitter.emit('admin.queue');
        } catch (error) {
            console.error(`Error enqueuing user ${userId}: ${error}`);
            release();
            return false;
        } finally {
            release();
        }
        return true;
    }

    private async isUserInQueueOrGame(userId: number): Promise<boolean> {
        return this.users.has(userId) || (await this.gameService.isUserInAnyGame(userId));
    }

    private async addUserToQueue(userId: number, userInfo: { elo: number; socketId: string }): Promise<void> {
        this.users.set(userId, userInfo);
        const bucketKey = this.getBucketKey(userInfo.elo);
        if (!this.eloBuckets.has(bucketKey)) {
            this.eloBuckets.set(bucketKey, new Set<number>());
        }
        this.eloBuckets.get(bucketKey).add(userId);
    }

    private async checkForMatches(userId: number, elo: number) {
        const userBucketKey = this.getBucketKey(elo);
        const potentialBuckets = [userBucketKey - this.bucketSize, userBucketKey, userBucketKey + this.bucketSize];

        for (const bucketKey of potentialBuckets) {
            if (this.eloBuckets.has(bucketKey)) {
                for (const candidateId of this.eloBuckets.get(bucketKey)) {
                    if (candidateId !== userId && Math.abs(this.users.get(candidateId).elo - elo) <= this.bucketSize) {
                        console.log('Match found');

                        const gameId = this.gameService.generateGameId();

                        await this.gameService.addGameToActiveGamesList(
                            gameId,
                            new GameUserInfo(userId, this.users.get(userId).socketId, EGameSymbol.X), //user 1
                            new GameUserInfo(candidateId, this.users.get(candidateId).socketId, EGameSymbol.O) // user 2
                        );

                        const game = await this.gameService.getGameByGameId(gameId);

                        this.eventEmitter.emit(
                            'matchmaking.match-found',
                            game.user1Info,
                            game.user2Info,
                            game.isPlayer1Turn ? game.user1Info.symbol : game.user2Info.symbol,
                            gameId
                        );

                        this.removePlayersFromQueue(userBucketKey, userId, bucketKey, candidateId);
                        return;
                    }
                }
            }
        }
    }

    private removePlayersFromQueue(userBucketKey: number, userId: number, bucketKey: number, candidateId: number) {
        this.eloBuckets.get(userBucketKey).delete(userId);
        this.eloBuckets.get(bucketKey).delete(candidateId);
        this.users.delete(userId);
        this.users.delete(candidateId);
    }

    private getBucketKey(elo: number): number {
        return Math.floor(elo / this.bucketSize) * this.bucketSize;
    }

    async dequeueUser(socketId: string) {
        const release = await this.mutex.acquire();
        try {
            let userId: number | undefined = undefined;

            // Find userId by socketId
            for (let [key, value] of this.users.entries()) {
                if (value.socketId === socketId) {
                    userId = key;
                    break;
                }
            }

            if (userId === undefined) {
                console.log(`Socket ID ${socketId} does not correspond to any queued user.`);
                return false;
            }

            this.removeUserFromQueue(userId);
        } catch (error) {
            console.error(`Error dequeue user with Socket ID ${socketId}: ${error}`);
            return false;
        } finally {
            release();
            this.eventEmitter.emit('admin.queue');
        }
        return true;
    }


    private removeUserFromQueue(userId: number): void {
        const userInfo = this.users.get(userId);
        if (!userInfo) return; // Exit if no user info is found

        const bucketKey = this.getBucketKey(userInfo.elo);
        this.users.delete(userId);

        const bucket = this.eloBuckets.get(bucketKey);
        if (bucket) {
            bucket.delete(userId);

            if (bucket.size === 0) {
                this.eloBuckets.delete(bucketKey);
            }
        }
    }


    async getMatchmakingQueue(): Promise<any> {
        if(this.users.entries() === undefined)
            return [];

        let queueSnapshot = [];
        for (const [userId, userInfo] of this.users.entries()) {
            const bucketKey = this.getBucketKey(userInfo.elo);
            queueSnapshot.push({
                userId,
                elo: userInfo.elo,
                socketId: userInfo.socketId,
                bucket: bucketKey,
            });
        }
        return queueSnapshot;
    }
}
