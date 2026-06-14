// Apply pending SQL migrations in db/migrations against DATABASE_URL.
//
// Each *.sql file runs once, in a transaction, in filename order, and is then
// recorded in a schema_migrations table so re-runs are no-ops. This is a
// forward-only runner that keeps the migrations as plain SQL; if you ever need
// down-migrations or more ceremony, reach for a tool like node-pg-migrate.
//
// Run with `npm run migrate` (which loads .env for DATABASE_URL).
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error(
		'DATABASE_URL is not set. Add it to .env (see .env.example) — it is the ' +
			'direct Postgres connection string, not the public Data API URL.',
	);
	process.exit(1);
}

const migrationsDir = join(
	dirname(fileURLToPath(import.meta.url)),
	'migrations',
);
const sql = postgres(databaseUrl, { onnotice: () => {} });

try {
	await sql`
		create table if not exists schema_migrations (
			version text primary key,
			applied_at timestamptz not null default now()
		)
	`;

	const appliedRows = await sql`select version from schema_migrations`;
	const applied = new Set(appliedRows.map((row) => row.version));

	const files = (await readdir(migrationsDir))
		.filter((name) => name.endsWith('.sql'))
		.sort();

	let count = 0;
	for (const file of files) {
		const version = file.replace(/\.sql$/, '');
		if (applied.has(version)) {
			continue;
		}

		const content = await readFile(join(migrationsDir, file), 'utf8');
		// Run the whole file (multiple statements) then record it, atomically.
		await sql.begin(async (tx) => {
			await tx.unsafe(content).simple();
			await tx`insert into schema_migrations (version) values (${version})`;
		});
		console.log(`✓ applied ${file}`);
		count += 1;
	}

	console.log(
		count === 0 ? 'No pending migrations.' : `Applied ${count} migration(s).`,
	);
} catch (error) {
	console.error(
		'Migration failed:',
		error instanceof Error ? error.message : error,
	);
	process.exitCode = 1;
} finally {
	await sql.end();
}
