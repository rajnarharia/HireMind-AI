import os
import re

directory = "C:\\Users\\welcome\\OneDrive\\Desktop\\HireMind-AI\\frontend\\src\\pages"

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "useEffect(" not in content:
        return

    # Extract useEffect block(s)
    use_effect_pattern = re.compile(r"(\s*useEffect\(\(\) => \{.*?\},\s*\[.*?\]\);)", re.DOTALL)
    effects = use_effect_pattern.findall(content)
    
    # Remove effects from content
    new_content = content
    for effect in effects:
        new_content = new_content.replace(effect, "")
        
    # Extract async function blocks (fetchX etc)
    func_pattern = re.compile(r"(\s*async function [a-zA-Z0-9_]+\(.*?\)\s*\{.*?\n\s*\})", re.DOTALL)
    funcs = func_pattern.findall(new_content)
    
    for func in funcs:
        new_content = new_content.replace(func, "")
        
    # Extract normal function blocks that were converted (updateStatus etc)
    norm_func_pattern = re.compile(r"(\s*function [a-zA-Z0-9_]+\(.*?\)\s*\{.*?\n\s*\})", re.DOTALL)
    norm_funcs = norm_func_pattern.findall(new_content)
    
    # We want to skip ScoreRing etc if they are React components. 
    # Let's only move functions that are lowercased (like fetchDashboard, updateStatus)
    valid_norm_funcs = []
    for func in norm_funcs:
        # Get function name
        match = re.search(r"function ([a-zA-Z0-9_]+)", func)
        if match:
            name = match.group(1)
            if name[0].islower():
                valid_norm_funcs.append(func)
                new_content = new_content.replace(func, "")
            else:
                # Component like ScoreRing. Leave it, or actually we should move it OUTSIDE the component.
                pass
                
    # Find the last hook declaration (useState, useAuth, useNavigate, useParams)
    hook_pattern = re.compile(r"(\s*const\s+\[.*?\]\s*=\s*useState.*?;|\s*const\s+\{.*?\}\s*=\s*useAuth.*?;|\s*const\s+[a-zA-Z0-9_]+\s*=\s*use[A-Z].*?;)")
    hooks = list(hook_pattern.finditer(new_content))
    
    if hooks:
        last_hook = hooks[-1]
        insert_pos = last_hook.end()
        
        funcs_str = "".join(funcs)
        norm_funcs_str = "".join(valid_norm_funcs)
        effects_str = "".join(effects)
        
        new_content = new_content[:insert_pos] + "\n" + funcs_str + norm_funcs_str + effects_str + new_content[insert_pos:]
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            fix_file(os.path.join(root, file))
