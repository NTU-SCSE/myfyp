from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^search/', views.SectionSearchView.as_view(), name='section_search_view'),
]