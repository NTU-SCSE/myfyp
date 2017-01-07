from celery.decorators import task
from myfyp.logger import setup_logger
from .crawler import crawl_books, crawl_sections
import time
from django.core.cache import cache
from datetime import datetime


logger = setup_logger(__name__)


@task(bind=True)
def crawl_task(self, book_id_list, version):
    lock_id = '{0}-lock'.format(self.name)
    acquire_lock = lambda: cache.add(lock_id, 'true')  # cache.add fails if the key already exists
    release_lock = lambda: cache.delete(lock_id)
    if acquire_lock():
        try:
            print("start 10 sec")
            time.sleep(10)
            print("finish 10 sec")
            # crawl_books(book_id_list)
            # crawl_sections(book_id_list, version)
        finally:
            release_lock()
        logger.info('All documents are successfully crawled.')
        cache.set('last_crawl_time', datetime.now().strftime("%I:%M %p on %d %B %Y"), None)
        cache.set('last_crawl_tid', self.request.id, None)
        return cache.get('last_crawl_tid')
    else:
        logger.info("Another crawling process is running.")
        return None

