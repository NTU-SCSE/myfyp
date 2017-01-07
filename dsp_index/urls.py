from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.AdminView.as_view(), name='admin_page'),
    url(r'^login/', views.LoginView.as_view(), name='login_page'),
    url(r'^poll_state/', views.poll_task_state, name='task_state'),
    url(r'^last_crawl/', views.get_last_crawl, name='last_crawl'),
]