from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic.base import TemplateView
from .crawler import crawl_books, crawl_sections

#
# def crawl(request):
#     book_id_list = crawl_books()
#     crawl_sections(book_id_list=book_id_list, source_version=3)
#     return HttpResponse("successfully crawled.")

class CrawlView(TemplateView):
    template_name = 'dsp_index/crawl_page.html'


class IndexView(TemplateView):
    template_name = 'dsp_index/index_page.html'


class LoginView(TemplateView):
    template_name = 'dsp_index/login_page.html'