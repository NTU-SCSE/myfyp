from django import template


def replace(value, arg):
    """Replaces all values of arg by '...'"""
    return value.replace(arg, '...')

register = template.Library()
register.filter('replace', replace)
