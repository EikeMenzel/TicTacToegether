import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function ApiPublicOperation(summary: string, description?: string): MethodDecorator {
    return applyDecorators(
        ApiOperation({
            summary: summary,
            description: description ? `${description} (This endpoint is public.)` : 'This endpoint is public.',
        })
    );
}
