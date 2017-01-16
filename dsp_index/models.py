from django.db import models
from treebeard.mp_tree import MP_Node
from django.core.validators import validate_comma_separated_integer_list


class Book(models.Model):
    book_id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=255)
    pages = models.IntegerField()
    pdf = models.CharField(max_length=100)

    def __str__(self):
        return "book {id}: {title}".format(id=self.book_id, title=self.title)


class Section(models.Model):
    section_id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=255)
    text = models.TextField()
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    page = models.IntegerField()
    pdf = models.CharField(max_length=100)

    def __str__(self):
        return "section {id}: {title}".format(id=self.section_id, title=self.title)


class Concept(MP_Node):
    label = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)

    node_order_by = ['label', 'name']

    def __str__(self):
        return "{0} {1}".format(self.label, self.name)


class ConceptMapping(models.Model):
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE)
    term = models.CharField(max_length=255)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    nth_match = models.CharField(max_length=100, validators=[validate_comma_separated_integer_list])

    def __str__(self):
        return "concept mapping: ({sid}, {nth}, {term})->{concept}".format(sid=self.section.section_id,
                                                                           nth=self.nth_match,
                                                                           term=self.term,
                                                                           concept=self.concept.name)

    class Meta:
        unique_together = ('concept', 'section', 'term',)