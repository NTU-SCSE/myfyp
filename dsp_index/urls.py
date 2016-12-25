from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'', views.AdminView.as_view(), name='admin_page'),
    url(r'^login/', views.LoginView.as_view(), name='login_page'),
]