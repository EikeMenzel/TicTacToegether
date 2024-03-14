import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './authentication/decorators/Public';
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('Serve Frontend')
@Controller()
export class AppController {
    @ApiOperation({
        summary: 'Serve Frontend Application',
        description: 'Catch-all route to serve the frontend application.'
    })
    @ApiResponse({
        status: 200,
        description: 'Frontend application served successfully.'
    })
    @Public()
    @Get()
    catchAll(@Res() response: Response) {
        response.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    }
}
