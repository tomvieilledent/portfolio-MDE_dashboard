"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.utils import extend_schema
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from apps.users.auth_views import CustomTokenObtainPairView, CustomTokenRefreshView


# Tag schema views
class TaggedSpectacularAPIView(SpectacularAPIView):
    @extend_schema(tags=["schema"])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TaggedSpectacularSwaggerView(SpectacularSwaggerView):
    @extend_schema(tags=["schema"], exclude=True)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


urlpatterns = [
    path("", TaggedSpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui-root"),
    path("admin/", admin.site.urls),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("api/users/", include("apps.users.urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("api/schema/", TaggedSpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", TaggedSpectacularSwaggerView.as_view(url_name="schema"),
         name="swagger-ui"),
]
