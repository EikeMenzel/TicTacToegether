import {Controller, Get, HttpStatus, UseGuards} from '@nestjs/common';
import {IsAdminGuard} from "../../../user/guard/is-admin/is-admin.guard";
import {AdminPanelService} from "../../services/admin-panel/admin-panel.service";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('Admin Panel')
@Controller('api/v1')
@UseGuards(IsAdminGuard)
export class AdminPanelController {
    constructor(
        private adminPanelService: AdminPanelService
    ) {}

    @ApiOperation({ summary: 'Get Matchmaking Queue', description: 'Retrieves the current matchmaking queue.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Matchmaking queue retrieved successfully.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You are not allowed to query this route!' })
    @Get('admin/queue')
    async getMatchmakingQueue(): Promise<any> {
        return await this.adminPanelService.getMatchmakingQueue();
    }

    @ApiOperation({ summary: 'Get All Games', description: 'Retrieves all games.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'All games retrieved successfully.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You are not allowed to query this route!' })
    @Get('admin/games')
    async getGames(): Promise<any> {
        return await this.adminPanelService.getAllGames();
    }
}
