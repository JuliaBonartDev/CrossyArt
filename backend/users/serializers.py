from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Pattern

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate_email(self, value):
        """Validar que el email no esté duplicado"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value

    def validate_username(self, value):
        """Validar que el username no esté duplicado"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas.')
        else:
            raise serializers.ValidationError('Username y password son requeridos.')

        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')


class PatternSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Pattern
        fields = ('id', 'user_username', 'image', 'image_url', 'name', 'size', 'description', 'is_favorite', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'user_username')

    def validate_image(self, value):
        """Validar que el tamaño de la imagen no exceda 5MB"""
        max_size = 5 * 1024 * 1024  # 5MB en bytes
        if value.size > max_size:
            raise serializers.ValidationError(
                f'El tamaño del archivo excede el límite de 5MB. Tamaño actual: {value.size / (1024*1024):.2f}MB'
            )
        return value

    def get_image_url(self, obj):
        """Retorna la URL completa de la imagen"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
