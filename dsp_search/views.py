from django.shortcuts import render
from haystack.generic_views import SearchView
from .forms import SectionSearchForm

def view_home_page(request):
    form = SectionSearchForm()
    return render(request, 'dsp_search/home_page.html', {'search_form': form})


class SectionSearchView(SearchView):
    template_name = 'dsp_search/results_page.html'
    form_class = SectionSearchForm
    form_name = 'search_form'
