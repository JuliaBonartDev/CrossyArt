#!/usr/bin/env python
import os
import django
from django.contrib.auth.models import User

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Crear usuario de prueba
if not User.objects.filter(username='testuser').exists():
    User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )
    print('Usuario testuser creado exitosamente')
else:
    print('El usuario testuser ya existe')
