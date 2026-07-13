import os
import re

WORKS_DIR = "c:/Users/11238/OneDrive/Desktop/My portfolio/works"
HEADER_TEMPLATE_PATH = "c:/Users/11238/OneDrive/Desktop/My portfolio/header-template.html"

def main():
    with open(HEADER_TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        header_content = f.read().strip()

    for filename in os.listdir(WORKS_DIR):
        if filename.endswith(".html"):
            filepath = os.path.join(WORKS_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Pattern to match the existing <header class="works-topbar">...</header>
            # The pattern needs to match multiple lines.
            pattern = re.compile(r'<header class="works-topbar">.*?</header>', re.DOTALL)
            
            # Pattern to match the existing <header class="topbar">...</header> in case it's already using it but we want to unify
            pattern2 = re.compile(r'<header class="topbar"[\s\S]*?</header>', re.DOTALL)

            if pattern.search(content):
                new_content = pattern.sub(header_content, content)
            elif pattern2.search(content):
                new_content = pattern2.sub(header_content, content)
            else:
                print(f"No header found to replace in {filename}")
                continue

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"Updated {filename}")

if __name__ == "__main__":
    main()
