#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

print("\n" + "="*60)
print("USUARIOS REGISTRADOS EN LA BASE DE DATOS")
print("="*60 + "\n")

users = User.objects.all()

if users.exists():
    for user in users:
        print(f"👤 Usuario: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Nombre: {user.first_name or '(no especificado)'}")
        print(f"   Apellido: {user.last_name or '(no especificado)'}")
        print(f"   Fecha de registro: {user.date_joined.strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"   Activo: {'✓ Sí' if user.is_active else '✗ No'}")
        print()
else:
    print("❌ No hay usuarios registrados aún.\n")

print("="*60 + "\n")
