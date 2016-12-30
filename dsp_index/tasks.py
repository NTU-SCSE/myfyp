from celery.decorators import task
from celery.utils.log import get_task_logger
from .crawler import crawl_books, crawl_sections


logger = get_task_logger(__name__)


@task(name="crawl_books")
def crawl_books_task(book_id_list):
    logger.info("Crawling books")
    crawl_books(book_id_list)


@task(name="crawl_sections")
def crawl_sections_task(book_id_list, version):
    logger.info("Crawling sections")
    crawl_sections(book_id_list, version)

