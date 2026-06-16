"""Seed default admin superuser via data migration."""
from django.db import migrations


def create_default_admin(apps, schema_editor):
    """Create admin superuser if none exists."""
    User = apps.get_model("users", "User")
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser(
            username="admin",
            email="admin@test.com",
            password="Admin123456",
            role="admin",
        )


def remove_default_admin(apps, schema_editor):
    """Reverse: delete the seeded admin."""
    User = apps.get_model("users", "User")
    User.objects.filter(username="admin", is_superuser=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0005_add_performance_indexes"),
    ]

    operations = [
        migrations.RunPython(
            create_default_admin,
            reverse_code=remove_default_admin,
        ),
    ]
