from django import forms
from haystack.forms import SearchForm
from dsp_index.models import Section


class SectionSearchForm(SearchForm):
    # Override input field q from parent class
    q = forms.CharField(required=True, label='', widget=forms.TextInput(attrs={'type': 'search', 'class':'form-control',
                                                                     'size':'50', 'placeholder':'Type here...'}))

    # Override search() from parent class
    def search(self):
        sqs = super(SectionSearchForm, self).search()
        return sqs.models(Section)