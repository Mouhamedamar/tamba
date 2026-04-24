import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('cellules', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='cellule',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='responsables', to='cellules.cellule'),
        ),
    ]
