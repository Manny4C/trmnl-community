// Our checked-in migration has top-level statements starting in column 1.
// Function-body statements are indented, so their semicolons stay intact.
export const migrationStatements=schema=>schema.split(/;\s*\n(?=(?:CREATE|INSERT)\b)/).map(s=>s.trim()).filter(Boolean);
