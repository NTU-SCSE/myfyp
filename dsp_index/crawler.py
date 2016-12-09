from pdf_client import config
from pdf_client.api import book, section
from pdf_client.multithread.processor import TextProcessor
from pdf_client.multithread.worker import MultiThreadWorker
from .models import Book, Section
from myfyp.logger import setup_logger


# Load crawling configurations
config.load_from_file('dsp_index/config.json')

# Set up INFO-level logger
logger = setup_logger(__name__)


def crawl_books():
    book_list = book.List().execute()
    book_id_list = list()
    new_books = list()
    for bk in book_list:
        new_book = Book(book_id=bk['id'], title=bk['title'], pages=bk['pages'])
        new_books.append(new_book)
        book_id_list.append(bk['id'])
    Book.objects.bulk_create(new_books)
    return book_id_list


class SectionDownloader(TextProcessor):
    def process(self, text, section_id):
        return text


def crawl_sections(book_id_list, source_version):
    for bid in book_id_list:

        worker = MultiThreadWorker(processor=SectionDownloader(), book=bid, threads=10, source=source_version)
        completed = worker.start()

        new_sections = list()
        for future in completed:
            section_id, text = future.result()
            section_detail = section.Detail(section_id).execute()
            associated_book = Book.objects.get(book_id=section_detail['book'])
            new_section = Section(section_id=section_id, title=section_detail['title'], text=text,
                                  book=associated_book, page=section_detail['page'])
            new_sections.append(new_section)
            logger.info('Retrieved section ID: {id}'.format(id=section_id))

        Section.objects.bulk_create(new_sections)









