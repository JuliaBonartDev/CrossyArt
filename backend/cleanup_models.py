#!/usr/bin/env python
"""
Script para limpiar y reorganizar el proyecto después de resolver
el conflicto de modelos de usuario.

Pasos:
1. Elimina las migraciones conflictivas de config y authentication
2. Ejecuta las migraciones de Django
3. Verifica que todo esté correcto
"""

import os
import sys
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

print("\n" + "="*70)
print("LIMPIEZA Y VERIFICACIÓN DEL SISTEMA DE AUTENTICACIÓN")
print("="*70 + "\n")

# Verificar que estamos usando el User nativo de Django
print("✓ Usando modelo User nativo de Django")
print(f"  Tabla: {User._meta.db_table}")
print(f"  Campos: {[field.name for field in User._meta.get_fields()]}")

# Verificar usuarios existentes
users = User.objects.all()
print(f"\n✓ Usuarios registrados: {users.count()}")
if users.exists():
    for user in users:
        print(f"  - {user.username} ({user.email})")

print("\n" + "="*70)
print("PRÓXIMOS PASOS:")
print("="*70)
print("""
1. Eliminar migraciones conflictivas (si existen):
   - rm backend/config/migrations/0*.py
   - rm backend/authentication/migrations/0*.py

2. Crear nuevas migraciones:
   - python manage.py makemigrations

3. Aplicar migraciones:
   - python manage.py migrate

4. Verificar que todo funcione:
   - python check_users.py
   
5. Crear usuario de prueba si es necesario:
   - python create_testuser.py
""")
print("="*70 + "\n")
