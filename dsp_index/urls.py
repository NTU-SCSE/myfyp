from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^crawl/', views.CrawlView.as_view(), name='crawl_page'),
    url(r'^index/', views.IndexView.as_view(), name='index_page'),
    url(r'^login/', views.LoginView.as_view(), name='login_page'),
]