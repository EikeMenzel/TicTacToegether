import {Controller, Get, HttpStatus, UseGuards} from '@nestjs/common';
import {IsAdminGuard} from "../../../user/guard/is-admin/is-admin.guard";
import {AdminPanelService} from "../../services/admin-panel/admin-panel.service";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {AdminQueueItemDTO} from "../../payload/AdminQueueItemDTO";
import {AdminGameItemDTO} from "../../payload/AdminGameItemDTO";
import {AdminApiOperation} from "../../../custom-swagger-annotations/ApiAdminOperation";

@ApiTags('Admin Panel')
@ApiBearerAuth()
@Controller('api/v1')
@UseGuards(IsAdminGuard)
export class AdminPanelController {
    constructor(
        private adminPanelService: AdminPanelService
    ) {}

    @AdminApiOperation('Get Matchmaking Queue', 'Retrieves the current matchmaking queue.')
    @ApiOkResponse({ status: HttpStatus.OK, description: 'Matchmaking queue retrieved successfully.', type: AdminQueueItemDTO, isArray: true })
    @Get('admin/queue')
    async getMatchmakingQueue(): Promise<AdminQueueItemDTO[]> {
        return await this.adminPanelService.getMatchmakingQueue();
    }

    @AdminApiOperation('Get All Games', 'Retrieves all games.')
    @ApiOkResponse({ status: HttpStatus.OK, description: 'All games retrieved successfully.', type: AdminGameItemDTO, isArray: true })
    @Get('admin/games')
    async getGames(): Promise<AdminGameItemDTO[]> {
        return await this.adminPanelService.getAllGames();
    }
}
