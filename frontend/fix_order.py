import os
import re

directory = "C:\\Users\\welcome\\OneDrive\\Desktop\\HireMind-AI\\frontend\\src\\pages"

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all useEffect blocks
    # A useEffect block looks like:
    # useEffect(() => {
    # ...
    # }, [...]);
    
    # We will find them using a regex that balances braces, but a simpler way 
    # since these files are predictably formatted:
    
    use_effect_pattern = re.compile(r"(\s*useEffect\(\(\) => \{.*?\},\s*\[.*?\]\);)", re.DOTALL)
    
    effects = use_effect_pattern.findall(content)
    
    if not effects:
        return

    new_content = content
    for effect in effects:
        new_content = new_content.replace(effect, "")
        
    # Now insert all effects right before `return (`
    
    # find `  return (` or `return (`
    return_pattern = r"(\s*return\s*\()"
    
    match = re.search(return_pattern, new_content)
    if match:
        insertion_point = match.start()
        
        effects_str = "\n".join(effects) + "\n"
        
        new_content = new_content[:insertion_point] + effects_str + new_content[insertion_point:]
        
        print(f"Fixed {filepath}")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            fix_file(os.path.join(root, file))
