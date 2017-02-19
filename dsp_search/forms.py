from django import forms
from haystack.forms import SearchForm
from dsp_index.models import Section, Concept, ConceptMapping
import json


class SectionSearchForm(SearchForm):
    # Override input field q from parent class
    q = forms.CharField(required=True, label='', widget=forms.TextInput(attrs={'type': 'search',
                                                                               'class': 'form-control',
                                                                               'size': '50',
                                                                               'placeholder': 'Type here...'}))
    with_field = 'with'
    without_field = 'without'

    def search(self):
        """ Override search() from parent class. """
        to_have = json.loads(self.data.get(self.with_field, '[]'))
        not_to_have = json.loads(self.data.get(self.without_field, '[]'))
        sqs = super(SectionSearchForm, self).search().models(Section)
        to_remove = self.get_removed_sids(sqs, to_have, not_to_have)
        return sqs.exclude(sid__in=to_remove)

    def get_removed_sids(self, queryset, to_have, not_to_have):
        """ Return a list of section IDs that are to be filtered out. """
        to_remove = set()
        if to_have == [] and not_to_have == []:
            return to_remove
        else:
            for result in queryset:
                mappings = ConceptMapping.objects.filter(section=result.pk)
                concepts = Concept.objects.filter(pk__in=mappings.values('concept')).distinct()
                related_labels = set()
                for concept in concepts:
                    temp_set = set(concept.get_ancestors().values_list('label', flat=True))
                    temp_set.add(concept.label)
                    related_labels.update(temp_set)
                if self.is_out(related_labels, to_have, not_to_have):
                    to_remove.add(result.pk)
            return to_remove

    def is_out(self, concept_labels, to_have, not_to_have):
        """ Check whether a section with the given set of concept labels is admissible. """
        to_have_set = set(to_have)
        not_to_have_set = set(not_to_have)

        if concept_labels.issuperset(to_have_set):
            if not_to_have_set == set():
                return False
            elif concept_labels & not_to_have_set == set():
                return False
        return True