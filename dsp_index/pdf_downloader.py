from pdf_client.api import section, book
import json, requests, os
from django.conf import settings


config_file = 'dsp_index/config.json'


def locate_section(section_id):
    section_detail = section.Detail(section_id).execute()
    if section_detail['next'] is not None:
        next_section_detail = section.Detail(section_detail['next']).execute()
        end_page = next_section_detail['page']
    else:
        book_detail = book.Detail(section_detail['book']).execute()
        end_page = book_detail['pages'] - 1
    return section_detail['book'], section_detail['page'], end_page


def get_config():
    with open(config_file, 'r') as file:
        config = json.loads(file.read().replace('\n', ''))
    return config


def send_request(book_id, start_page=None, end_page=None):
    config = get_config()
    if start_page is None or end_page is None:
        url = "{base}book/read/{book_id}/".format(base=config['base_url'],
                                                  book_id=book_id)
    else:
        url = "{base}book/read/{book_id}/{start}/{end}/".format(base=config['base_url'],
                                                                book_id=book_id,
                                                                start=start_page,
                                                                end=end_page)
    response = requests.get(url, stream=True, auth=(config['auth_args'][0], config['auth_args'][1]))
    return response


def download_a_section(section_id):
    book_id, start_page, end_page = locate_section(section_id)
    response = send_request(book_id, start_page, end_page)
    relative_path = os.path.join("sections", "{bid}".format(bid=book_id), "{sid}.pdf".format(sid=section_id))
    full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'wb+') as file:
        for chunk in response.iter_content(chunk_size=1024):
            file.write(chunk)
    return relative_path


def download_a_book(book_id):
    response = send_request(book_id)
    relative_path = os.path.join("books", "{bid}.pdf".format(bid=book_id))
    full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'wb+') as file:
        for chunk in response.iter_content(chunk_size=1024):
            file.write(chunk)
    return relative_path
