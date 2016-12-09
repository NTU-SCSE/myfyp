from django.db import models


class Book(models.Model):
    book_id = models.IntegerField(primary_key=True)
    title = models.TextField()
    pages = models.IntegerField()

    def __str__(self):
        return "[{id}] {title}".format(id=self.book_id, title=self.title)


class Section(models.Model):
    section_id = models.IntegerField(primary_key=True)
    title = models.TextField()
    text = models.TextField()
    book = models.ForeignKey(Book, on_delete=models.CASCADE, null=True)
    page = models.IntegerField()

    def __str__(self):
        return "[{id}] {title}".format(id=self.section_id, title=self.title)
