import {readFile} from 'node:fs/promises';import {neon} from '@neondatabase/serverless';import {migrationStatements} from '../lib/migration.js';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required; never put credentials in arguments.');
const sql=neon(process.env.DATABASE_URL),schema=await readFile(new URL('../lib/schema.sql',import.meta.url),'utf8');
await sql.transaction(migrationStatements(schema).map(s=>sql.query(s,[])));console.log('Tiny Planet schema initialized.');
