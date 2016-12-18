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

    def get_results_count(self):
        queryset = super(SectionSearchView, self).get_queryset()
        return queryset.count()

    def get_context_data(self, *args, **kwargs):
        context = super(SectionSearchView, self).get_context_data(*args, **kwargs)
        context.update({'count': self.get_results_count()})
        return context


class SectionDetailsView(SearchView):
    template_name = 'dsp_search/details_page.html'
    form_class = SectionSearchForm
    form_name = 'search_form'