from django.contrib import admin
from .models import Book, Section


class BookAdmin(admin.ModelAdmin):
    list_display = ('book_id', 'title', 'pages')


class SectionAdmin(admin.ModelAdmin):
    list_display = ('section_id', 'title', 'book', 'page')


admin.site.register(Book, BookAdmin)
admin.site.register(Section, SectionAdmin)