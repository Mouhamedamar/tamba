# Generated migration for performance indexes
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('membres', '0005_alter_membre_numero_carte_electeur_and_more'),
    ]

    operations = [
        # Index pour les recherches fréquentes
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_telephone ON membres(telephone);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_telephone;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_nom ON membres(nom);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_nom;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_prenom ON membres(prenom);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_prenom;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_quartier ON membres(quartier);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_quartier;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_cellule ON membres(cellule_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_cellule;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_is_deleted ON membres(is_deleted);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_is_deleted;"
        ),
        
        # Index composite pour les requêtes communes
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_cellule_active ON membres(cellule_id, is_deleted);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_cellule_active;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_membres_search ON membres(nom, prenom, quartier);",
            reverse_sql="DROP INDEX IF EXISTS idx_membres_search;"
        ),
    ]
