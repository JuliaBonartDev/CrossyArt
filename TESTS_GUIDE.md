# Testing Guide - Favorites System

## Backend Tests (Django)

### Running Tests

```bash
# Navigate to backend directory
cd backend

# Run all pattern tests
python manage.py test users.test_patterns

# Run specific test class
python manage.py test users.test_patterns.PatternModelTest

# Run specific test method
python manage.py test users.test_patterns.PatternAPITest.test_create_pattern_authenticated

# Run with verbose output
python manage.py test users.test_patterns --verbosity=2

# Run with coverage report
pip install coverage
coverage run --source='users' manage.py test users.test_patterns
coverage report
coverage html  # Generates HTML report in htmlcov/
```

### Test Coverage

#### PatternModelTest
- ✅ **test_create_pattern**: Verifica que se puede crear un Pattern correctamente
  - Crea imagen fake con PIL
  - Valida todos los campos (name, size, description, is_favorite)
  - Verifica relación con User

- ✅ **test_pattern_str**: Valida la representación en string del modelo
  - Confirma que __str__ incluye username y nombre del patrón

#### PatternAPITest
- ✅ **test_create_pattern_authenticated**: Crear patrón autenticado
  - POST a `/api/auth/patterns/`
  - Valida status 201 CREATED
  - Verifica todos los campos en la respuesta

- ✅ **test_create_pattern_unauthenticated**: Rechaza creación sin token
  - POST sin autenticación
  - Espera status 401 UNAUTHORIZED

- ✅ **test_get_user_patterns**: Lista patrones del usuario
  - GET a `/api/auth/patterns/list/`
  - Valida que solo muestra patrones del usuario autenticado
  - Verifica ordenamiento (más reciente primero)

- ✅ **test_get_user_favorites**: Filtra solo favoritos
  - GET a `/api/auth/patterns/favorites/`
  - Verifica que todos tengan `is_favorite=True`
  - Valida cantidad correcta

- ✅ **test_update_pattern**: Actualiza patrón
  - PATCH a `/api/auth/patterns/{id}/`
  - Valida cambios en BD

- ✅ **test_update_pattern_not_owned**: Aislamiento de usuarios
  - Intenta actualizar patrón de otro usuario
  - Espera 404 NOT FOUND

- ✅ **test_delete_pattern**: Elimina patrón
  - DELETE a `/api/auth/patterns/{id}/delete/`
  - Valida status 204 NO CONTENT
  - Verifica que fue eliminado de BD

- ✅ **test_delete_pattern_not_owned**: Seguridad de eliminación
  - Intenta eliminar patrón ajeno
  - Espera 404 NOT FOUND

- ✅ **test_patterns_ordered_by_date**: Orden por fecha
  - Verifica que los patrones más recientes aparecen primero

---

## Frontend Tests (React + Vitest)

### Setup

```bash
# Navigate to frontend directory
cd frontend/vite-project

# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Add to vite.config.js:
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js']
  }
})
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- FavoritesModal.test.jsx

# Run with coverage
npm run test -- --coverage
```

### Test Coverage

#### FavoritesModal Component Tests
- ✅ **debe renderizar el modal correctamente**
  - Verifica que aparecen los patrones favoritos
  - Valida título "My Favorites"

- ✅ **debe mostrar mensaje cuando no hay favoritos**
  - Muestra "no patterns saved" cuando array está vacío

- ✅ **debe mostrar información del patrón correctamente**
  - Verifica nombre, tamaño, imagen
  - Comprueba formato correcto de datos

- ✅ **debe manejar descargas correctamente**
  - Simula click en botón Download
  - Verifica creación de elemento `<a>`
  - Valida atributos `href` y `download`

- ✅ **debe manejar eliminaciones correctamente**
  - Mock de `patternService.deletePattern`
  - Verifica confirmación de usuario
  - Llama callback `onDeleteFavorite`

- ✅ **debe cerrar modal cuando se hace click en X**
  - Valida que se llama `onClose`

- ✅ **debe no mostrar modal cuando show es false**
  - Verifica que DOM no contiene modal

#### Pattern Service Tests
- ✅ **debe crear un patrón correctamente**
  - Mock de fetch
  - Verifica endpoint correcto
  - Valida FormData con imagen

- ✅ **debe obtener favoritos correctamente**
  - GET a `/favorites/`
  - Filtra solo `is_favorite=true`

- ✅ **debe eliminar un patrón correctamente**
  - DELETE a `/patterns/{id}/delete/`
  - Status 204 NO CONTENT

- ✅ **debe manejar errores en las peticiones**
  - Simula error de red
  - Valida rechazo de promesa

---

## Integration Tests

### Manual Testing Flow

#### 1. User Registration & Login
```
1. Open application
2. Click "Sign Up" 
3. Fill form (email, password, confirm)
4. Submit
5. Login with credentials
6. Verify authenticated state
```

#### 2. Create Pattern
```
1. Upload image
2. Set size (150, 230, 300)
3. Click "Save to Favorites"
4. Verify pattern saved to DB
5. Verify in FavoritesModal
```

#### 3. Download Pattern
```
1. Open FavoritesModal
2. Click "Download" on pattern
3. Verify file downloaded to device
4. File name = pattern name
```

#### 4. Delete Pattern
```
1. Open FavoritesModal
2. Click "Delete" on pattern
3. Confirm deletion
4. Verify removed from list
5. Verify removed from BD (check DB)
```

#### 5. User Isolation
```
1. Login as User A
2. Save Pattern A
3. Logout
4. Login as User B
5. Verify cannot see Pattern A
6. Save Pattern B
7. Logout and Login as User A
8. Verify only Pattern A visible
```

#### 6. Session Persistence
```
1. Login and save patterns
2. Close browser/tab
3. Open application
4. Verify patterns still there (from BD)
5. Verify user still logged in (JWT token)
```

---

## Code Quality Checks

### Backend

```bash
# Install linting tools
pip install flake8 black isort django-extensions

# Check code style
flake8 users/

# Format code
black users/

# Sort imports
isort users/

# Check test coverage
coverage run --source='users' manage.py test users.test_patterns
coverage report --fail-under=80
```

### Frontend

```bash
# ESLint (should already be configured)
npm run lint

# Format code
npm run format

# Check for unused imports
npm run lint -- --fix
```

---

## Database Validation

### Check Pattern Records
```sql
-- Connect to SQLite DB
sqlite3 backend/db.sqlite3

-- View all patterns
SELECT id, user_id, name, size, is_favorite, created_at FROM users_pattern;

-- View patterns for specific user
SELECT * FROM users_pattern WHERE user_id = 1;

-- Count patterns by user
SELECT user_id, COUNT(*) as total FROM users_pattern GROUP BY user_id;

-- Check image storage
SELECT name, image FROM users_pattern WHERE id = 1;
```

### Check Media Files
```bash
# List all uploaded pattern images
ls -la backend/media/patterns/*/

# Verify image files exist
find backend/media/patterns -type f -name "*.png"
```

---

## Performance Testing

### Load Testing (Optional)
```bash
# Install locust
pip install locust

# Create locustfile.py with pattern endpoints
# Run load test against development server
locust -f locustfile.py -u 100 -r 10 -t 1m http://127.0.0.1:8000
```

### Database Query Optimization
```bash
# Enable query logging in settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}

# Run tests with query logging
python manage.py test users.test_patterns
```

---

## Troubleshooting

### Backend Tests
| Issue | Solution |
|-------|----------|
| `ImportError: No module named users` | Run `python manage.py test users.test_patterns` from backend dir |
| `Media files not found` | Ensure MEDIA_ROOT and MEDIA_URL in settings.py |
| `JWT token errors` | Verify simplejwt is installed: `pip install djangorestframework-simplejwt` |
| `Database locked` | Delete `db.sqlite3` and run `python manage.py migrate` |

### Frontend Tests
| Issue | Solution |
|-------|----------|
| `Cannot find module '@testing-library/react'` | Run `npm install` in vite-project |
| `jsdom environment not found` | Install vitest with: `npm install -D jsdom` |
| `Mock not working` | Use `vi.mock()` before imports, clear with `vi.clearAllMocks()` |
| `Async test timeout` | Increase timeout: `vi.setConfig({ testTimeout: 10000 })` |

---

## Test Execution Checklist

- [ ] Backend migrations applied (`python manage.py migrate`)
- [ ] Test database created (`python manage.py test --keepdb`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Vitest configured in vite.config.js
- [ ] JWT secret in settings.py
- [ ] MEDIA_ROOT points to valid directory
- [ ] All endpoints tested via curl/Postman (optional)
- [ ] CI/CD pipeline passes (if applicable)

---

## Summary

**Total Test Coverage:**
- Backend: 11 test cases covering models, authentication, CRUD operations, user isolation
- Frontend: 11 test cases covering component rendering, event handlers, API integration
- Integration: 6 manual testing flows covering end-to-end scenarios

**Key Validations:**
✅ Users can only access their own patterns
✅ Patterns persist in database across sessions
✅ Image upload/download works correctly
✅ Deletion removes patterns from BD and UI
✅ Authentication required for all endpoints
✅ Proper error handling and status codes
