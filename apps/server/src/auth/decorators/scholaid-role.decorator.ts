import { SetMetadata } from '@nestjs/common';
import type { ScholaidRole } from '@/auth/types/session.types';

export const SCHOLAID_ROLES_KEY = 'scholaidRoles';

/**
 * Gates a route or controller to specific Scholaid entity types.
 *
 * Works alongside the global AuthGuard (route must still be authenticated)
 * and is enforced by ScholaidRoleGuard.
 *
 * @example
 * // Single role
 * @ScholaidRoles('lecturer')
 * @Get('classroom')
 * getClassroom() {}
 *
 * @example
 * // Multiple roles — any of these may access the route
 * @ScholaidRoles('lecturer', 'institution')
 * @Get('reports')
 * getReports() {}
 */
export const ScholaidRoles = (...roles: ScholaidRole[]) =>
  SetMetadata(SCHOLAID_ROLES_KEY, roles);
