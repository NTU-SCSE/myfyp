from django.shortcuts import render
from django.http import HttpResponse
from .crawler import crawl_books, crawl_sections


def crawl(request):
    book_id_list = crawl_books()
    crawl_sections(book_id_list=book_id_list, source_version=3)
    return HttpResponse("successfully crawled.")

