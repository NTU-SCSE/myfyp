from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView
from .crawler import crawl_books, crawl_sections
from .forms import CrawlForm
#
# def crawl(request):
#     book_id_list = crawl_books()
#     crawl_sections(book_id_list=book_id_list, source_version=3)
#     return HttpResponse("successfully crawled.")

class AdminView(FormView):
    template_name = 'dsp_index/admin_page.html'
    form_class = CrawlForm
    success_url = '/admin/crawl/'

    def form_valid(self, form):
        # This method is called when valid form data has been POSTed.
        return super(AdminView, self).form_valid(form)


class LoginView(TemplateView):
    template_name = 'dsp_index/login_page.html'