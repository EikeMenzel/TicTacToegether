import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiForbiddenResponse } from '@nestjs/swagger';

export function AdminApiOperation(summary: string, description: string): MethodDecorator {
    return applyDecorators(
        ApiOperation({
            summary,
            description: `${description} Access is restricted to admin users only.`,
        }),
        ApiForbiddenResponse({ description: 'Access forbidden. This route is restricted to admin users.' })
    );
}
