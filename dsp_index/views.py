from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView
from .forms import CrawlForm
from .models import Book, Section


class AdminView(FormView):
    template_name = 'dsp_index/admin_page.html'
    form_class = CrawlForm
    success_url = '/admin/'

    def form_valid(self, form):
        """This method is called when valid form data has been POSTed."""
        # Delete all the entries in database
        Book.objects.all().delete()
        Section.objects.all().delete()
        # Crawl books
        form.get_books()
        # Crawl sections
        form.get_sections()
        return super(AdminView, self).form_valid(form)


class LoginView(TemplateView):
    template_name = 'dsp_index/login_page.html'
