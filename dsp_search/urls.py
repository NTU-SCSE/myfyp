from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.home_page, name='home_page'),
    url(r'^results/', views.SectionSearchView.as_view(), name='results_page'),
    url(r'^details/(?P<book>[0-9]+)/(?P<section>[0-9]+)/', views.SectionDetailsView.as_view(), name='details_page'),
    url(r'^pdf/(?P<book>[0-9]+)/(?:(?P<section>[0-9]+)/)?', views.PDFView.as_view(), name='pdf_viewer'),
    url(r'^mappings/', views.concept_to_terms, name='c2t_mappings'),
]