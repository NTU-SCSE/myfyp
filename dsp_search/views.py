from django.shortcuts import render
from haystack.generic_views import SearchView


def view_home_page(request):
    return render(request, 'dsp_search/home_page.html')


def view_results_page(request):
    return render(request, 'dsp_search/results_page.html')


# Create your views here.
class SectionSearchView(SearchView):
    template_name = 'dsp_search/search.html'
