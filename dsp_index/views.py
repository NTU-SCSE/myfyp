from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView
from django.http import HttpResponse
from django.core.cache import cache
from .forms import CrawlForm
from celery.result import AsyncResult
import json


SESSION_EXPIRE_TIME = 60

class AdminView(FormView):
    template_name = 'dsp_index/admin_page.html'
    form_class = CrawlForm
    success_url = '/admin/'

    def form_valid(self, form):
        """This method is called when valid form data has been POSTed."""
        # Crawl documents
        crawl_task = form.crawl()
        # Set session
        self.request.session.set_expiry(SESSION_EXPIRE_TIME)
        self.request.session['crawl_task_id'] = crawl_task.id

        return super(AdminView, self).form_valid(form)


class LoginView(TemplateView):
    template_name = 'dsp_index/login_page.html'


def poll_task_state(request):
    if request.is_ajax():
        if 'task_id' in request.POST.keys() and request.POST['task_id']:
            task_id = request.POST['task_id']
            task = AsyncResult(task_id)
            data = {'state': task.state, 'result': task.result}
        else:
            data = 'No task_id in the request.'
    else:
        data = 'This is not an ajax request.'

    json_data = json.dumps(data)
    return HttpResponse(json_data, content_type='application/json')


def get_last_crawl(request):
    if request.method == 'GET':
        data = cache.get('last_crawl_time'), cache.get('last_crawl_tid')
        if data is None:
            data = 'No crawl history found'
    else:
        data = 'This is not a GET request.'
    json_data = json.dumps(data)
    return HttpResponse(json_data, content_type='application/json')
