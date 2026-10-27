import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixLocationUniqueConstraint20261027110000 implements MigrationInterface {
  name = 'FixLocationUniqueConstraint20261027110000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop existing unconditional unique key constraint on Location(Name) if present
    await queryRunner.query(`
      DECLARE @ConstraintName NVARCHAR(200);
      SELECT @ConstraintName = kc.name
      FROM sys.key_constraints kc
      INNER JOIN sys.indexes i ON kc.parent_object_id = i.object_id AND kc.unique_index_id = i.index_id
      INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      WHERE kc.parent_object_id = OBJECT_ID(N'[dbo].[Location]')
        AND c.name = 'Name';

      IF @ConstraintName IS NOT NULL
      BEGIN
        EXEC('ALTER TABLE [dbo].[Location] DROP CONSTRAINT [' + @ConstraintName + ']');
      END
    `);

    // 2. Drop existing index if it exists as an independent index
    await queryRunner.query(`
      IF EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE object_id = OBJECT_ID(N'[dbo].[Location]') 
          AND name = 'UQ_3094f860eefeb59122d08ab88cb'
      )
      BEGIN
        DROP INDEX [UQ_3094f860eefeb59122d08ab88cb] ON [dbo].[Location];
      END
    `);

    // 3. Create filtered unique index enforcing uniqueness ONLY on active (non-deleted) locations
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE object_id = OBJECT_ID(N'[dbo].[Location]') 
          AND name = 'UQ_Location_Name_Active'
      )
      BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX [UQ_Location_Name_Active]
        ON [dbo].[Location] ([Name])
        WHERE [DeletedDate] IS NULL;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop filtered unique index
    await queryRunner.query(`
      IF EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE object_id = OBJECT_ID(N'[dbo].[Location]') 
          AND name = 'UQ_Location_Name_Active'
      )
      BEGIN
        DROP INDEX [UQ_Location_Name_Active] ON [dbo].[Location];
      END
    `);

    // 2. Re-create unconditional unique constraint
    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes 
        WHERE object_id = OBJECT_ID(N'[dbo].[Location]') 
          AND name = 'UQ_3094f860eefeb59122d08ab88cb'
      )
      BEGIN
        ALTER TABLE [dbo].[Location] ADD CONSTRAINT [UQ_3094f860eefeb59122d08ab88cb] UNIQUE ([Name]);
      END
    `);
  }
}
