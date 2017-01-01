import logging
import pdf_client
from pdf_client.api import book, section
from pdf_client.multithread.processor import TextProcessor
from pdf_client.multithread.worker import MultiThreadWorker
from .models import Book, Section
from myfyp.logger import setup_logger
from .pdf_downloader import download_a_book, download_a_section


# Set up INFO-level logger
# Disable 'propagate' property from pdf_client logger
logger = setup_logger(__name__)
logging.getLogger(pdf_client.multithread.worker.__name__).propagate = False


def crawl_books(book_id_list):
    chosen_books = list()
    for bid in book_id_list:
        path = download_a_book(bid)
        book_detail = book.Detail(bid).execute()
        temp_book = Book(book_id=book_detail['id'], title=book_detail['title'], pages=book_detail['pages'], pdf=path)
        chosen_books.append(temp_book)
        logger.info('Crawled book ID: {id}'.format(id=bid))
    Book.objects.bulk_create(chosen_books)


class SectionDownloader(TextProcessor):
    def process(self, text, section_id):
        return text


def crawl_sections(book_id_list, source_version):
    for bid in book_id_list:
        worker = MultiThreadWorker(processor=SectionDownloader(), book=bid, threads=10, source=source_version)
        completed = worker.start()  # Start the worker and return an iterator
        new_sections = list()
        for future in completed:
            section_id, text = future.result()
            path = download_a_section(section_id)
            section_detail = section.Detail(section_id).execute()
            associated_book = Book.objects.get(book_id=section_detail['book'])
            new_section = Section(section_id=section_id, title=section_detail['title'], text=text,
                                  book=associated_book, page=section_detail['page'], pdf=path)
            new_sections.append(new_section)
            logger.info('Crawled section ID: {id}'.format(id=section_id))
        Section.objects.bulk_create(new_sections)









