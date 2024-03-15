import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './authentication/decorators/Public';
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {ApiPublicOperation} from "./custom-swagger-annotations/ApiPublicOperation";

@ApiTags('Serve Frontend')
@Controller()
export class AppController {
    @Public()
    @ApiPublicOperation('Serve Frontend Application', 'Catch-all route to serve the frontend application.')
    @ApiResponse({
        status: 200,
        description: 'Frontend application served successfully.'
    })
    @Get()
    catchAll(@Res() response: Response) {
        response.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    }
}
