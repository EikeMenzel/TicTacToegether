import {Controller, Get, HttpStatus, UseGuards} from '@nestjs/common';
import {IsAdminGuard} from "../../../user/guard/is-admin/is-admin.guard";
import {AdminPanelService} from "../../services/admin-panel/admin-panel.service";
import {ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AdminQueueItemDTO} from "../../payload/AdminQueueItemDTO";
import {AdminGameItemDTO} from "../../payload/AdminGameItemDTO";
import {AdminApiOperation} from "../../../custom-swagger-annotations/ApiAdminOperation";

@ApiTags('Admin Panel')
@ApiBearerAuth()
@Controller('api/v1')
@UseGuards(IsAdminGuardHttp)
export class AdminPanelController {
    /**
     * Constructor to inject dependencies into the AdminPanelController.
     *
     * @param adminPanelService - Service to perform admin panel related operations, such as retrieving matchmaking queues and games.
     */
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
