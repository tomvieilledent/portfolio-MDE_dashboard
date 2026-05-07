from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_view, extend_schema
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import UserSerializer

User = get_user_model()


class IsSelfOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


@extend_schema_view(
    list=extend_schema(tags=["users"]),
    create=extend_schema(tags=["users"]),
    retrieve=extend_schema(tags=["users"]),
    update=extend_schema(tags=["users"]),
    partial_update=extend_schema(tags=["users"]),
    destroy=extend_schema(tags=["users"]),
)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsSelfOrAdmin()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @extend_schema(tags=["users"])
    @action(detail=True, methods=["put"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
