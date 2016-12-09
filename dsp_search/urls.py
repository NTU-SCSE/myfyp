from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.view_home_page, name='home_page'),
    url(r'^results/', views.view_results_page, name='results_page'),
    url(r'^search/', views.SectionSearchView.as_view(), name='section_search_view'),
]