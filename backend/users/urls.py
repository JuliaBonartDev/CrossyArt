from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('refresh-token/', views.refresh_token, name='refresh_token'),
    
    # Pattern endpoints
    path('patterns/', views.create_pattern, name='create_pattern'),
    path('patterns/list/', views.get_user_patterns, name='get_user_patterns'),
    path('patterns/favorites/', views.get_user_favorites, name='get_user_favorites'),
    path('patterns/<int:pattern_id>/', views.update_pattern, name='update_pattern'),
    path('patterns/<int:pattern_id>/delete/', views.delete_pattern, name='delete_pattern'),
]
