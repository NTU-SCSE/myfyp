from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.view_home_page, name='home_page'),
    url(r'^results/', views.SectionSearchView.as_view(), name='results_page'),
    url(r'^details/', views.SectionDetailsView.as_view(), name='details_page'),

]