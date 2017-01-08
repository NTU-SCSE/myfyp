from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.conf import settings
from haystack.generic_views import SearchView
from .forms import SectionSearchForm
import os


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

    def get_context_data(self, *args, **kwargs):
        context = super(SectionDetailsView, self).get_context_data(*args, **kwargs)
        context.update({'book_id': self.kwargs['book'], 'section_id': self.kwargs['section']})
        return context


class PDFView(TemplateView):
    template_name = 'dsp_search/pdf_viewer.html'

    def get_context_data(self, *args, **kwargs):
        context = super(PDFView, self).get_context_data(*args, **kwargs)
        section_url = os.path.join(settings.MEDIA_URL, 'sections/{0}/{1}.pdf'.format(self.kwargs['book'], self.kwargs['section']))
        context.update({'pdf_url': section_url})
        return context

