from django.db import models
from django.contrib.auth.models import User

class Pattern(models.Model):
    """
    Modelo para almacenar patrones creados por usuarios
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patterns')
    image = models.ImageField(upload_to='patterns/%Y/%m/%d/')
    name = models.CharField(max_length=255, blank=True, default='Untitled Pattern')
    size = models.IntegerField()  # Tamaño del patrón (150, 230, 300)
    description = models.TextField(blank=True, null=True)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Patterns'

    def __str__(self):
        return f"{self.name} - {self.user.username}"
