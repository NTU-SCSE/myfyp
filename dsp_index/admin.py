from django.contrib import admin
from .models import Book, Section, ConceptMapping


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('book_id', 'title', 'pages')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('section_id', 'title', 'book', 'page')


@admin.register(ConceptMapping)
class ConceptMappingAdmin(admin.ModelAdmin):
    list_display = ('name', 'term', 'section', 'nth_match')


