from django.contrib import admin
from .models import Book, Section, ConceptMapping, Concept
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('book_id', 'title', 'pages')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('section_id', 'title', 'book', 'page')


@admin.register(ConceptMapping)
class ConceptMappingAdmin(admin.ModelAdmin):
    list_display = ('concept', 'term', 'section', 'nth_match')


@admin.register(Concept)
class ConceptAdmin(TreeAdmin):
    fields = ('label', 'name', '_position', '_ref_node_id',)
    form = movenodeform_factory(Concept)
