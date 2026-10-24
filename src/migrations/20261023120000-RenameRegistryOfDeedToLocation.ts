import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames the physical table dbo.RegistryOfDeed -> dbo.Location.
 *
 * Column names (User.RegistryOfDeedId / Transaction.RegistryOfDeedId) and the
 * audit tables (RegistryOfDeed_Log / RegistryOfDeed_Hist) are intentionally
 * left unchanged. Triggers and FK constraints stay bound to the table's
 * object_id, so they keep working after the rename.
 */
export class RenameRegistryOfDeedToLocation20261023120000 implements MigrationInterface {
  name = 'RenameRegistryOfDeedToLocation20261023120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RegistryOfDeed]') AND type = N'U')
         AND NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Location]') AND type = N'U')
      BEGIN
        EXEC sp_rename N'[dbo].[RegistryOfDeed]', N'Location';
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Location]') AND type = N'U')
         AND NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RegistryOfDeed]') AND type = N'U')
      BEGIN
        EXEC sp_rename N'[dbo].[Location]', N'RegistryOfDeed';
      END
    `);
  }
}
