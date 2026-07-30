import { EPHEMERAL_DATABASE } from '../src/database/database';

/**
 * Every backend spec runs against an ephemeral database, so a test run never
 * touches the developer's real data/tracker.db and each application instance
 * starts empty — isolation without faking the filesystem boundary.
 *
 * Registered by BOTH jest configs (package.json for the unit/integration suite,
 * test/jest-e2e.json for the e2e suite) — an unregistered config would fall back
 * to the default path and write to real data.
 *
 * Deliberately unconditional rather than `??=`: honouring an inherited
 * TRACKER_DB_PATH would point the whole suite at whatever database the developer
 * happens to have exported, which is exactly the accident this prevents. A spec
 * that needs real cross-instance persistence overrides it with its own unique
 * temp path before building an instance (the path is read at provider
 * construction time, not at module load).
 */
process.env.TRACKER_DB_PATH = EPHEMERAL_DATABASE;
