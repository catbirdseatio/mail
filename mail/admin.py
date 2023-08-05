from django.contrib import admin

from mail.models import Email

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    pass
