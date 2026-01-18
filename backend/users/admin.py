from django.contrib import admin
from .models import Pattern

@admin.register(Pattern)
class PatternAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'size', 'is_favorite', 'created_at')
    list_filter = ('is_favorite', 'size', 'created_at')
    search_fields = ('name', 'user__username', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'name', 'description', 'size')
        }),
        ('Image', {
            'fields': ('image',)
        }),
        ('Status', {
            'fields': ('is_favorite',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
