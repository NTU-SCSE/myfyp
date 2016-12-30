from __future__ import absolute_import
from .celery import app as celery_app
import pymysql

# Use PyMySQL to impersonate MySQLdb
pymysql.install_as_MySQLdb()
