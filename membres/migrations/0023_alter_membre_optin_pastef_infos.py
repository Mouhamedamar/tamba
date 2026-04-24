from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('membres', '0005_alter_membre_numero_carte_electeur_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='membre',
            name='optin_pastef_infos',
            field=models.BooleanField(default=False, verbose_name="Abonné aux informations Pastef"),
        ),
    ]