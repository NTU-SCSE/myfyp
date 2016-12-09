from django.shortcuts import render
from haystack.generic_views import SearchView

def view_homepage(request):
    return render(request, 'dsp_search/homepage.html')


# Create your views here.
class SectionSearchView(SearchView):
    template_name = 'dsp_search/search.html'
