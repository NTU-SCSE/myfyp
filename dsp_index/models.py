from django.db import models


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


class ConceptMapping(models.Model):
    name = models.CharField(max_length=255)
    term = models.CharField(max_length=255)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    nth_match = models.IntegerField()

    def __str__(self):
        return "concept mapping: ({sid}, {nth}, {term})->{concept}".format(sid=self.section.section_id,
                                                                           nth=self.nth_match,
                                                                           term=self.term,
                                                                           concept=self.name)
