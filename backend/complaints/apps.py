from django.apps import AppConfig


class ComplaintsConfig(AppConfig):
    default_auto_fields='django.db.models.BigAutoField'
    name = 'complaints'
    def ready(self):
        import complaints.signals
