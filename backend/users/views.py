from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, PatternSerializer
from .models import Pattern


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Endpoint para registrar un nuevo usuario
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                'message': 'Usuario registrado exitosamente',
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Endpoint para hacer login y obtener tokens JWT
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data.get('user')
        refresh = RefreshToken.for_user(user)
        
        return Response(
            {
                'message': 'Login exitoso',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            },
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Endpoint para obtener el perfil del usuario autenticado
    """
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Endpoint para refrescar el token JWT
    """
    refresh = request.data.get('refresh')
    if not refresh:
        return Response({'error': 'Token de refresco requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh_token_obj = RefreshToken(refresh)
        return Response(
            {
                'access': str(refresh_token_obj.access_token),
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Pattern endpoints

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pattern(request):
    """
    Endpoint para crear un nuevo patrón
    """
    serializer = PatternSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_patterns(request):
    """
    Endpoint para obtener todos los patrones del usuario autenticado
    """
    patterns = Pattern.objects.filter(user=request.user)
    serializer = PatternSerializer(patterns, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_favorites(request):
    """
    Endpoint para obtener los patrones favoritos del usuario
    """
    favorites = Pattern.objects.filter(user=request.user, is_favorite=True)
    serializer = PatternSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_pattern(request, pattern_id):
    """
    Endpoint para actualizar un patrón (nombre, descripción, favorito, etc)
    """
    try:
        pattern = Pattern.objects.get(id=pattern_id, user=request.user)
    except Pattern.DoesNotExist:
        return Response({'error': 'Pattern not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PatternSerializer(pattern, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_pattern(request, pattern_id):
    """
    Endpoint para eliminar un patrón
    """
    try:
        pattern = Pattern.objects.get(id=pattern_id, user=request.user)
    except Pattern.DoesNotExist:
        return Response({'error': 'Pattern not found'}, status=status.HTTP_404_NOT_FOUND)
    
    pattern.delete()
    return Response({'message': 'Pattern deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
