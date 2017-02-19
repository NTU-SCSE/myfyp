from haystack import indexes
from .models import Section


class SectionIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    book = indexes.CharField(model_attr='book', faceted=True)
    page = indexes.CharField(model_attr='page')
    sid = indexes.CharField(model_attr='section_id')
    # Add content_auto for autocomplete
    content_auto = indexes.EdgeNgramField(model_attr='text')

    def get_model(self):
        return Section

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()

