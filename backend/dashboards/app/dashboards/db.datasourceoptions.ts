/**
 * Data source description file for Migrating TypeOrm data structures.
 * Check we have:
 * - migrations folder created in root (manually create the first time)
 * - our entities respect the naming format below.
 */

const _DBOptions = {
    type: "sqlite", /* default, in -mem option */
    entities: [__dirname + '/**/*.entity{.js,.ts}'],
    synchronize: process.env.DB_SYNC_FLAG === 'true',
    migrations: [__dirname + "/migrations/*.js"]
};

switch (process.env.NODE_ENV) {
    case 'dev': /* Run with in-mem db */
        Object.assign(_DBOptions, {
            type: process.env.DB_TYPE,
            database: process.env.DB_NAME,
            autoLoadEntities: true, /* Entities require forFeature registration to be detected */
        });
        break;
    case 'test': /* run tests on proper db for integration */
        Object.assign(_DBOptions, {
            type: process.env.DB_TYPE,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            autoLoadEntities: true, /* Entities require forFeature registration to be detected */
            migrationsRun: true, /* run migrations  before testing*/
        });
        break;
    case 'prod': /* run on proper db mapped to service */
        Object.assign(_DBOptions, {
            type: process.env.DB_TYPE,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            autoLoadEntities: true, /* Entities require forFeature registration to be detected */
            migrationsRun: true, /* run migrations  */
        });
        break;

    default:
        throw new Error('unknown environment');
}

export const DBOptions = _DBOptions;