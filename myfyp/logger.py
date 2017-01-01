import logging


def setup_logger(logger_name, level=logging.INFO, propagate=False):
    logger = logging.getLogger(logger_name)
    formatter = logging.Formatter('%(asctime)s : %(message)s')
    file_handler = logging.FileHandler('log/{filename}.log'.format(filename=logger_name))
    file_handler.setFormatter(formatter)

    logger.setLevel(level)
    logger.addHandler(file_handler)
    logger.propagate = propagate

    return logger
