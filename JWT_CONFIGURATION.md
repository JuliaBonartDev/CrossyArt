# CONFIGURACIÓN DE JWT CON EXPIRACIÓN Y REFRESH TOKENS

## Status: ✅ IMPLEMENTADO

## Configuración de tokens en settings.py

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Token acceso válido 15 minutos
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # Token refresh válido 7 días
    'ROTATE_REFRESH_TOKENS': True,                   # Generar nuevo refresh token en cada refresh
    'BLACKLIST_AFTER_ROTATION': True,                # Invalida refresh token anterior
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}
```

## Flujo de autenticación:

```
1. USUARIO INICIA SESIÓN
   └─> POST /api/auth/login/
       ├─ access_token (válido 15 minutos)
       └─ refresh_token (válido 7 días)

2. USUARIO REALIZA ACCIONES (dentro de 15 minutos)
   └─> GET /api/auth/profile/
       └─ Header: Authorization: Bearer <access_token>
          ✓ Funcionará correctamente

3. DESPUÉS DE 15 MINUTOS (token expirado)
   └─> GET /api/auth/profile/
       └─ Respuesta: 401 Unauthorized
          ├─ Frontend detecta 401
          └─> POST /api/auth/refresh-token/
              └─ Body: { "refresh": <refresh_token> }
                 ├─ Genera nuevo access_token
                 ├─ Genera nuevo refresh_token (rotación)
                 └─ Invalida el refresh_token anterior
          
          ├─ Frontend guarda los nuevos tokens
          └─> Reintenta GET /api/auth/profile/
              ✓ Funcionará correctamente

4. REFRESH TOKEN EXPIRADO (después de 7 días)
   └─> POST /api/auth/refresh-token/
       └─ Respuesta: 401 Unauthorized
          ├─ Frontend limpia tokens
          └─> Redirige al usuario a Login
```

## Implementación en Frontend

### api.js
- ✅ `refreshAccessToken()` - Maneja el refresh automático
- ✅ `apiCall()` - Intercepta 401 y refresca automáticamente
- ✅ Reintentos automáticos de peticiones

### Flujo automático:
1. Usuario hace una petición
2. Si recibe 401 → Intenta refrescar automáticamente
3. Si refresh exitoso → Reintenta la petición original
4. Si refresh falla → Limpia tokens y redirige a login

## Seguridad

✓ Access tokens cortos (15 minutos) - Reducen ventana de ataque
✓ Refresh tokens largos (7 días) - Mantienen sesión abierta  
✓ Rotación de refresh tokens - Genera nuevo en cada refresh
✓ Invalidación de refresh antiguos - Evita reutilización
✓ Tokens almacenados en localStorage - Accesibles por JavaScript (XSRF protected por Django)

## Endpoints disponibles

```
POST /api/auth/register/
  Body: {
    "username": "user",
    "email": "user@example.com",
    "password": "pass123",
    "password2": "pass123"
  }
  Response: {
    "message": "Usuario registrado exitosamente",
    "user": { "id": 1, "username": "user", "email": "...", "date_joined": "..." }
  }

POST /api/auth/login/
  Body: {
    "username": "user",
    "password": "pass123"
  }
  Response: {
    "message": "Login exitoso",
    "user": { ... },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1Q...",
      "refresh": "eyJ0eXAiOiJKV1Q..."
    }
  }

GET /api/auth/profile/  [REQUIERE ACCESS TOKEN]
  Header: Authorization: Bearer <access_token>
  Response: {
    "id": 1,
    "username": "user",
    "email": "user@example.com",
    "date_joined": "2026-01-16T10:30:00Z"
  }

POST /api/auth/refresh-token/
  Body: {
    "refresh": "<refresh_token>"
  }
  Response: {
    "access": "eyJ0eXAiOiJKV1Q...",
    "refresh": "eyJ0eXAiOiJKV1Q..."
  }
```

## Cómo funciona en la app

1. **Al registrarse**: Se crea usuario y se puede hacer login inmediatamente
2. **Al hacer login**: Se guardan access_token y refresh_token en localStorage
3. **En cada petición autenticada**: Se envía automáticamente el access_token
4. **Cuando expira (15 min)**: Frontend automáticamente usa refresh_token para obtener uno nuevo
5. **Cuando refresh expira (7 días)**: Usuario debe volver a hacer login

## Sin necesidad de logout en backend

Como mencionaste, con este sistema de refresh tokens:
- ✓ No necesitamos endpoint de logout en el backend
- ✓ El logout es solo limpiar tokens en frontend
- ✓ Los refresh tokens no se puede reutilizar después de rotar
- ✓ Después de 7 días sin actividad, la sesión expira automáticamente

## Próximo paso

Después de confirmar que esta configuración está bien:
- Proteger rutas del frontend (componentes que requieren autenticación)
- Mostrar estado del usuario en el header
- Agregar validación de contraseña fuerte en registro
