from django.shortcuts import render
from haystack.generic_views import SearchView
from django.views.generic.base import TemplateView
from .forms import SectionSearchForm
from pdf_client import config
from pdf_client.api import section
import json, requests, os
from django.conf import settings

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
    config_file = 'dsp_search/config.json'

    def __init__(self):
        super(SectionDetailsView, self).__init__()
        config.load_from_file(self.config_file)

    def locate_section(self):
        section_id = self.kwargs['section']
        section_detail = section.Detail(section_id).execute()
        next_section_detail = section.Detail(section_detail['next']).execute()
        return section_detail['book'], section_detail['page'], next_section_detail['page']

    def get_context_data(self, *args, **kwargs):
        context = super(SectionDetailsView, self).get_context_data(*args, **kwargs)
        location = self.locate_section()
        context.update({'book_id': location[0], 'start_page': location[1], 'end_page': location[2]})
        return context


class PDFView(TemplateView):
    template_name = 'dsp_search/pdf_viewer.html'
    config_file = 'dsp_search/config.json'

    def get_config(self):
        with open(self.config_file, 'r') as file:
            config = json.loads(file.read().replace('\n', ''))
        return config

    def send_request(self):
        config = self.get_config()
        url = "{base}book/read/{book_id}/{start}/{end}/".format(base=config['base_url'],
                                                                book_id=self.kwargs['book'],
                                                                start=self.kwargs['start'],
                                                                end=self.kwargs['end'])
        response = requests.get(url, stream=True, auth=(config['auth_args'][0], config['auth_args'][1]))
        return response

    def save_pdf(self):
        response = self.send_request()
        filename = "{book_id}_{start}_{end}.pdf".format(book_id=self.kwargs['book'],
                                                        start=self.kwargs['start'],
                                                        end=self.kwargs['end'])
        filepath = os.path.join(settings.MEDIA_ROOT, filename)
        with open(filepath, 'wb+') as file:
            for chunk in response.iter_content(chunk_size=1024):
                file.write(chunk)

        file_url = os.path.join(settings.MEDIA_URL, filename)
        return file_url

    def get_context_data(self, *args, **kwargs):
        context = super(PDFView, self).get_context_data(*args, **kwargs)
        file_url = self.save_pdf()
        context.update({'pdf_url': file_url})
        return context