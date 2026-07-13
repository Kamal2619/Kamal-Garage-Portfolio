import urllib.request
import sys
from html.parser import HTMLParser

# Ensure standard output can print UTF-8 characters on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class HTMLTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tr = False
        self.in_td = False
        self.current_row = []
        self.rows = []
        self.temp_data = ""

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.in_table = True
        elif tag == 'tr':
            self.in_tr = True
            self.current_row = []
        elif tag in ('td', 'th'):
            self.in_td = True
            self.temp_data = ""

    def handle_endtag(self, tag):
        if tag == 'table':
            self.in_table = False
        elif tag == 'tr':
            self.in_tr = False
            if self.current_row:
                self.rows.append(self.current_row)
        elif tag in ('td', 'th'):
            self.in_td = False
            self.current_row.append(self.temp_data.strip())

    def handle_data(self, data):
        if self.in_td:
            self.temp_data += data

def parse_and_print_letters(url):
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response:
            html_content = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching URL: {e}")
        return

    parser = HTMLTableParser()
    parser.feed(html_content)

    grid = {}
    max_x = 0
    max_y = 0

    for row in parser.rows:
        if len(row) < 3:
            continue
        try:
            x = int(row[0])
            char = row[1]
            y = int(row[2])
            grid[(x, y)] = char
            if x > max_x:
                max_x = x
            if y > max_y:
                max_y = y
        except ValueError:
            continue

    # Let's find which columns are entirely empty
    empty_cols = []
    for x in range(max_x + 1):
        col_empty = True
        for y in range(max_y + 1):
            if (x, y) in grid:
                col_empty = False
                break
        if col_empty:
            empty_cols.append(x)

    # Group adjacent non-empty columns to segment characters
    letters = []
    current_letter_cols = []
    for x in range(max_x + 1):
        if x not in empty_cols:
            current_letter_cols.append(x)
        else:
            if current_letter_cols:
                letters.append(current_letter_cols)
                current_letter_cols = []
    if current_letter_cols:
        letters.append(current_letter_cols)

    # Print each letter individually
    for idx, cols in enumerate(letters):
        print(f"--- Letter {idx + 1} (columns {cols[0]} to {cols[-1]}) ---")
        for y in range(max_y, -1, -1):
            row_str = ""
            for x in cols:
                row_str += grid.get((x, y), " ")
            print(row_str)
        print()

if __name__ == "__main__":
    url = "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub"
    parse_and_print_letters(url)
