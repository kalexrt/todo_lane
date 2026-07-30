/**
 * Every backend spec defaults to an ephemeral database, so a test run never
 * touches the developer's real data/tracker.db and each application instance
 * starts empty — isolation without faking the filesystem boundary.
 *
 * A spec that needs real cross-instance persistence overrides this with its own
 * unique temp path before building an instance (the path is read at provider
 * construction time, not at module load).
 */
process.env.TRACKER_DB_PATH = ':memory:';
