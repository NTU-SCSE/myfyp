from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic.base import TemplateView
from django.conf import settings
from django.utils.safestring import mark_safe
from haystack.generic_views import SearchView
from .forms import SectionSearchForm
from dsp_index.models import ConceptMapping, Concept
import os, json


def home_page(request):
    form = SectionSearchForm()
    return render(request, 'dsp_search/home_page.html', {'search_form': form})


class SectionSearchView(SearchView):
    template_name = 'dsp_search/results_page.html'
    form_class = SectionSearchForm
    form_name = 'search_form'

    def __init__(self, *args, **kwargs):
        super(SectionSearchView, self).__init__(*args, **kwargs)
        self.queryset = super(SectionSearchView, self).get_queryset()

    def get_results_count(self):
        return self.queryset.count()

    def get_section_list(self):
        section_list = [section.object.section_id for section in self.queryset]
        return section_list

    def get_concept_tree(self):
        section_list = self.get_section_list()
        generator = ConceptDictionaryGenerator(section_list)
        dictionary = generator.dictionarize_concept_hierarchy()
        return json.dumps(dictionary)

    def get_section_counts(self):
        section_list = self.get_section_list()
        generator = ConceptDictionaryGenerator(section_list)
        dictionary = generator.get_section_counts()
        return json.dumps(dictionary)

    def get_context_data(self, *args, **kwargs):
        context = super(SectionSearchView, self).get_context_data(*args, **kwargs)
        context.update({'count': self.get_results_count(),
                        'concept_tree': mark_safe(self.get_concept_tree()),
                        'section_counts': mark_safe(self.get_section_counts())})
        return context


class SectionDetailsView(SearchView):
    template_name = 'dsp_search/details_page.html'
    form_class = SectionSearchForm
    form_name = 'search_form'

    def get_concept_tree(self):
        generator = ConceptDictionaryGenerator([self.kwargs['section'],])
        dictionary = generator.dictionarize_concept_hierarchy()
        return json.dumps(dictionary)

    def get_context_data(self, *args, **kwargs):
        context = super(SectionDetailsView, self).get_context_data(*args, **kwargs)
        context.update({'book_id': self.kwargs['book'],
                        'section_id': self.kwargs['section'],
                        'concept_tree': mark_safe(self.get_concept_tree())})
        return context


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


class ConceptDictionaryGenerator:
    def __init__(self, section_list):
        self.section_list = section_list

    def get_concept_list(self):
        mappings = ConceptMapping.objects.filter(section__in=self.section_list)
        concept_list = Concept.objects.filter(pk__in=mappings.values('concept'))
        return concept_list

    def get_concept_path(self, concept):
        path = list(concept.get_ancestors())
        path.append(concept)
        return path

    def get_section_counts(self):
        section_counts = {}
        for sid in self.section_list:
            related_clabels = self.get_related_concepts(sid)
            for label in related_clabels:
                if label not in section_counts:
                    section_counts[label] = 1
                else:
                    section_counts[label] += 1
        return section_counts

    def get_related_concepts(self, sid):
        mappings = ConceptMapping.objects.filter(section=sid)
        concepts = Concept.objects.filter(pk__in=mappings.values('concept')).distinct()
        ancestor_list = []
        for concept in concepts:
            ancestors = concept.get_ancestors()
            for anc in ancestors:
                if anc.label not in ancestor_list:
                    ancestor_list.append(anc.label)
        merged_list = ancestor_list
        for concept in concepts:
            if concept not in merged_list:
                merged_list.append(concept.label)
        return merged_list

    def dictionarize_concept_hierarchy(self):
        # Get all concepts for the section
        concept_list = self.get_concept_list()
        if not concept_list:
            return None
        # Initialize dictionary. All concepts have the same root.
        root = concept_list[0].get_root()
        dict = {'label': root.label, 'name': root.name, 'children': []}
        # Build the dictionary
        for concept in concept_list:
            concept_path = self.get_concept_path(concept)
            temp = dict
            # Add the concept path into current dictionary
            for index in range(1, len(concept_path)):
                clabels = [d['label'] for d in temp['children']]
                if concept_path[index].label in clabels:
                    temp = temp['children'][clabels.index(concept_path[index].label)]
                else:
                    temp['children'].append(self.dictionarize_concept_path(concept_path[index:]))
                    break
        return dict

    def dictionarize_concept_path(self, concept_path):
        # Initialize dictionary
        dict = {'label': concept_path[0].label, 'name': concept_path[0].name, 'children': []}
        # Recursive procedure
        if len(concept_path) == 1:
            return dict
        else:
            child = self.dictionarize_concept_path(concept_path[1:])
            dict['children'].append(child)
            return dict


def concept_to_terms(request):
    if request.method == 'GET':
        section = request.GET['section']
        clabel_list = json.loads(request.GET['concepts'])
        dictionary = {}

        for label in clabel_list:
            mappings = ConceptMapping.objects.filter(section=section, concept__label=label)
            dictionary[label] = [item for item in mappings.values_list('term','nth_match')]

        return HttpResponse(json.dumps(dictionary), content_type='application/json')





