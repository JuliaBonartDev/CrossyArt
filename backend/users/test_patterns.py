from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_404_NOT_FOUND
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import Pattern
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from PIL import Image


class PatternModelTest(TestCase):
    """Tests para el modelo Pattern"""
    
    def setUp(self):
        """Configurar usuario de prueba"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_pattern(self):
        """Test: Crear un patrón"""
        # Crear una imagen fake
        img = Image.new('RGB', (100, 100), color='red')
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        image = SimpleUploadedFile('test.png', img_io.getvalue(), content_type='image/png')
        
        pattern = Pattern.objects.create(
            user=self.user,
            image=image,
            name='Test Pattern',
            size=150,
            description='A test pattern',
            is_favorite=True
        )
        
        self.assertEqual(pattern.name, 'Test Pattern')
        self.assertEqual(pattern.size, 150)
        self.assertEqual(pattern.is_favorite, True)
        self.assertEqual(pattern.user, self.user)
    
    def test_pattern_str(self):
        """Test: Representación en string del modelo"""
        img = Image.new('RGB', (100, 100), color='red')
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        image = SimpleUploadedFile('test.png', img_io.getvalue(), content_type='image/png')
        
        pattern = Pattern.objects.create(
            user=self.user,
            image=image,
            name='Test',
            size=150
        )
        
        self.assertIn(self.user.username, str(pattern))
        self.assertIn('Test', str(pattern))


class PatternAPITest(APITestCase):
    """Tests para los endpoints de Pattern"""
    
    def setUp(self):
        """Configurar usuario de prueba y tokens"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def create_test_image(self):
        """Crear una imagen fake para pruebas"""
        img = Image.new('RGB', (100, 100), color='red')
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        return SimpleUploadedFile('test.png', img_io.getvalue(), content_type='image/png')
    
    def test_create_pattern_authenticated(self):
        """Test: Crear patrón siendo autenticado"""
        data = {
            'name': 'My Pattern',
            'size': 150,
            'description': 'Test description',
            'is_favorite': True,
            'image': self.create_test_image()
        }
        
        response = self.client.post('/api/auth/patterns/', data, format='multipart')
        
        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'My Pattern')
        self.assertEqual(response.data['size'], 150)
        self.assertTrue(response.data['is_favorite'])
    
    def test_create_pattern_unauthenticated(self):
        """Test: No permitir crear patrón sin autenticación"""
        self.client.credentials()  # Remover credenciales
        
        data = {
            'name': 'My Pattern',
            'size': 150,
            'image': self.create_test_image()
        }
        
        response = self.client.post('/api/auth/patterns/', data, format='multipart')
        self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_get_user_patterns(self):
        """Test: Obtener todos los patrones del usuario"""
        # Crear algunos patrones
        for i in range(3):
            Pattern.objects.create(
                user=self.user,
                image=self.create_test_image(),
                name=f'Pattern {i}',
                size=150,
                is_favorite=False
            )
        
        response = self.client.get('/api/auth/patterns/list/')
        
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
    
    def test_get_user_favorites(self):
        """Test: Obtener solo los patrones favoritos"""
        # Crear patrones (algunos favoritos, otros no)
        Pattern.objects.create(
            user=self.user,
            image=self.create_test_image(),
            name='Favorite 1',
            size=150,
            is_favorite=True
        )
        Pattern.objects.create(
            user=self.user,
            image=self.create_test_image(),
            name='Not Favorite',
            size=230,
            is_favorite=False
        )
        Pattern.objects.create(
            user=self.user,
            image=self.create_test_image(),
            name='Favorite 2',
            size=300,
            is_favorite=True
        )
        
        response = self.client.get('/api/auth/patterns/favorites/')
        
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        for pattern in response.data:
            self.assertTrue(pattern['is_favorite'])
    
    def test_update_pattern(self):
        """Test: Actualizar patrón"""
        pattern = Pattern.objects.create(
            user=self.user,
            image=self.create_test_image(),
            name='Original Name',
            size=150,
            is_favorite=False
        )
        
        update_data = {
            'name': 'Updated Name',
            'is_favorite': True
        }
        
        response = self.client.patch(
            f'/api/auth/patterns/{pattern.id}/',
            update_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Name')
        self.assertTrue(response.data['is_favorite'])
        
        # Verificar en BD
        pattern.refresh_from_db()
        self.assertEqual(pattern.name, 'Updated Name')
    
    def test_update_pattern_not_owned(self):
        """Test: No permitir actualizar patrón de otro usuario"""
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        pattern = Pattern.objects.create(
            user=other_user,
            image=self.create_test_image(),
            name='Other User Pattern',
            size=150
        )
        
        update_data = {'name': 'Hacked'}
        response = self.client.patch(
            f'/api/auth/patterns/{pattern.id}/',
            update_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)
    
    def test_delete_pattern(self):
        """Test: Eliminar patrón"""
        pattern = Pattern.objects.create(
            user=self.user,
            image=self.create_test_image(),
            name='To Delete',
            size=150
        )
        
        pattern_id = pattern.id
        response = self.client.delete(f'/api/auth/patterns/{pattern_id}/delete/')
        
        self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)
        
        # Verificar que fue eliminado
        self.assertFalse(Pattern.objects.filter(id=pattern_id).exists())
    
    def test_delete_pattern_not_owned(self):
        """Test: No permitir eliminar patrón de otro usuario"""
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        pattern = Pattern.objects.create(
            user=other_user,
            image=self.create_test_image(),
            name='Other User Pattern',
            size=150
        )
        
        response = self.client.delete(f'/api/auth/patterns/{pattern.id}/delete/')
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)
    
    def test_patterns_ordered_by_date(self):
        """Test: Los patrones se devuelven ordenados por fecha (más reciente primero)"""
        p1 = Pattern.objects.create(
            user=self.user,
            image=self.create_test_image(),
            name='First',
            size=150
        )
        p2 = Pattern.objects.create(
            user=self.user,
            image=self.create_test_image(),
            name='Second',
            size=150
        )
        
        response = self.client.get('/api/auth/patterns/list/')
        
        self.assertEqual(response.data[0]['name'], 'Second')
        self.assertEqual(response.data[1]['name'], 'First')
