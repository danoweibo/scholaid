import { SetMetadata } from '@nestjs/common';

export const CBT_ACCESS_KEY = 'cbtAccess';

/**
 * Restricts a route to standard students only.
 * Enthusiast students are blocked with 403.
 *
 * Must be used alongside @ScholaidRoles('student') — this decorator only
 * checks the student subtype, not the scholaidRole itself.
 *
 * @example
 * @Get('tests')
 * @ScholaidRoles('student')
 * @StandardStudentOnly()
 * getTests() {}
 *
 * Or apply at controller level to protect all routes in a CBT controller:
 * @Controller('cbt')
 * @ScholaidRoles('student')
 * @StandardStudentOnly()
 * export class CbtController {}
 */
export const StandardStudentOnly = () => SetMetadata(CBT_ACCESS_KEY, true);
