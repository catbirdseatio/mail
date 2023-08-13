from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.contrib import admin

from mail.models import Email


User = get_user_model()


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    pass

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    pass
