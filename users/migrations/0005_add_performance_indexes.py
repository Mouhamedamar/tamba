# Generated migration for performance indexes
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_cellule'),
    ]

    operations = [
        # Index pour les recherches fréquentes
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);",
            reverse_sql="DROP INDEX IF EXISTS idx_users_username;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
            reverse_sql="DROP INDEX IF EXISTS idx_users_email;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);",
            reverse_sql="DROP INDEX IF EXISTS idx_users_role;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_users_cellule ON users(cellule_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_users_cellule;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_users_date_joined ON users(date_joined);",
            reverse_sql="DROP INDEX IF EXISTS idx_users_date_joined;"
        ),
        
        # Index composite pour les requêtes communes
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_users_role_cellule ON users(role, cellule_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_users_role_cellule;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active, role);",
            reverse_sql="DROP INDEX IF EXISTS idx_users_active;"
        ),
    ]
