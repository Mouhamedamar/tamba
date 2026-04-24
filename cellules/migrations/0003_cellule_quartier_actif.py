from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cellules', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='cellule',
            name='quartier',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='cellule',
            name='actif',
            field=models.BooleanField(default=True),
        ),
    ]
