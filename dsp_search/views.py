from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.conf import settings
from haystack.generic_views import SearchView
from .forms import SectionSearchForm
from dsp_index.models import ConceptMapping, Concept
import os, json


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
        context.update({'book_id': self.kwargs['book'],
                        'section_id': self.kwargs['section'],
                        'concept_tree': json.dumps(self.dictionarize_concept_hierarchy())})
        return context

    def get_concept_list(self):
        mappings = ConceptMapping.objects.filter(section=self.kwargs['section'])
        concept_list = Concept.objects.filter(pk__in=mappings.values('concept'))
        return concept_list

    def get_concept_path(self, concept):
        path = list(concept.get_ancestors())
        path.append(concept)
        return path

    def dictionarize_concept_hierarchy(self):
        # Get all concepts for the section
        concept_list = self.get_concept_list()
        if not concept_list:
            return None
        # Initialize dictionary. All concepts have the same root.
        root = concept_list[0].get_root()
        dict = {'id': root.pk, 'name': root.name, 'nth_match': [], 'children': []}
        mapping = ConceptMapping.objects.filter(concept=root.pk, section=self.kwargs['section'])
        if mapping:
            dict['nth_match'] = list(map(int, mapping[0].nth_match.split(',')))
        # Build the dictionary
        for concept in concept_list:
            concept_path = self.get_concept_path(concept)
            temp = dict
            # Add the concept path into current dictionary
            for index in range(1, len(concept_path)):
                children_id = [d['id'] for d in temp['children']]
                if concept_path[index].pk in children_id:
                    temp = temp['children'][children_id.index(concept_path[index].pk)]
                else:
                    temp['children'].append(self.dictionarize_concept_path(concept_path[index:]))
                    break
        return dict

    def dictionarize_concept_path(self, concept_path):
        # Initialize dictionary
        dict = {'id': concept_path[0].pk, 'name': concept_path[0].name, 'nth_match': [], 'children': []}
        mapping = ConceptMapping.objects.filter(concept=concept_path[0].pk, section=self.kwargs['section'])
        if mapping:
            dict['nth_match'] = list(map(int, mapping[0].nth_match.split(',')))
        # Recursive procedure
        if len(concept_path) == 1:
            return dict
        else:
            child = self.dictionarize_concept_path(concept_path[1:])
            dict['children'].append(child)
            return dict


class PDFView(TemplateView):
    template_name = 'dsp_search/pdf_viewer.html'

    def get_context_data(self, *args, **kwargs):
        context = super(PDFView, self).get_context_data(*args, **kwargs)
        if self.kwargs['section'] is None:
            url = os.path.join(settings.MEDIA_URL, 'books/{0}.pdf'.format(self.kwargs['book']))
        else:
            url = os.path.join(settings.MEDIA_URL, 'sections/{0}/{1}.pdf'.
                               format(self.kwargs['book'], self.kwargs['section']))
        context.update({'pdf_url': url})
        return context


