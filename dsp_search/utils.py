from haystack.utils import Highlighter

class SectionHighlighter(Highlighter):

    def render_html(self, highlight_locations=None, start_offset=None, end_offset=None):

        highlighted_chunk = super(SectionHighlighter, self).render_html(highlight_locations, start_offset, end_offset)

        # Replace [FORMULA] with ...
        highlighted_chunk = highlighted_chunk.replace('[FORMULA]', '...')

        return highlighted_chunk