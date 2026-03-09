import os
import re

directory = r'c:\Users\Emre\Desktop\aduket\client\src'

def migrate_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
            
    original = content

    # Strip token extraction from localStorage
    content = re.sub(r'(?:const|let)\s+(?:token|storedToken)\s*=\s*localStorage\.getItem\([\'"\`]token[\'"\!`]\);?\s*', '', content)
    
    # Strip localStorage.getItem directly in strings
    content = re.sub(r'localStorage\.getItem\([\'"\`]token[\'"\`]\)', 'null', content)

    # Strip Authorization header lines
    content = re.sub(r'[\'"]?Authorization[\'"]?:\s*`Bearer \$\{token\}`\,?\s*', '', content)
    content = re.sub(r'[\'"]?Authorization[\'"]?:\s*`Bearer \$\{storedToken\}`\,?\s*', '', content)
    content = re.sub(r'[\'"]?Authorization[\'"]?:\s*`Bearer \$\{null\}`\,?\s*', '', content)

    # Strip login setters
    content = re.sub(r'localStorage\.setItem\([\'"\`]token[\'"\`],\s*[a-zA-Z0-9_\.]+\);?\s*', '', content)
    content = re.sub(r'localStorage\.removeItem\([\'"\`]token[\'"\`]\);?\s*', '', content)

    # Inject credentials: 'include' into fetch options if not present
    # We find fetch(..., { and ensure credentials: 'include' is right after
    def inject_credentials(match):
        m = match.group(0)
        if 'credentials' in m:
            return m
        return m + "\n                credentials: 'include',"

    # We do a bit of a hack: just replace all `fetch(..., {`
    content = re.sub(r'fetch\s*\(\s*[^,]+,\s*\{', inject_credentials, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Migrated: {filepath}')
        return True
    return False

changed = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            if migrate_file(filepath):
                changed += 1

print(f'Total files migrated: {changed}')
