from django import forms
from pdf_client.api import book, version


def get_book_options():
    book_list = book.List().execute()
    options = [(book['id'], book['title']) for book in book_list]
    return options

def get_version_options():
    version_list = version.List().execute()
    options = [(version['id'], "%s by %s" % (version['name'], version['owner'])) for version in version_list]
    return options

BOOK_OPTIONS = get_book_options()
VERSION_OPTIONS = get_version_options()

class CrawlForm(forms.Form):
    books = forms.MultipleChoiceField(choices=BOOK_OPTIONS,
                                      widget=forms.SelectMultiple(attrs={'class': 'form-control', 'size': '5'}))
    versions = forms.ChoiceField(choices=VERSION_OPTIONS,
                                 widget=forms.Select(attrs={'class': 'form-control'}))
