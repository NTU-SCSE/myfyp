from django.shortcuts import render
from haystack.generic_views import SearchView


# Create your views here.
class SectionSearchView(SearchView):
    template_name = 'dsp_search/search.html'
