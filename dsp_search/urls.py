from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.view_homepage, name='homepage'),
    url(r'^search/', views.SectionSearchView.as_view(), name='section_search_view'),
]