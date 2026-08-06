import os
import re

directory = "C:\\Users\\welcome\\OneDrive\\Desktop\\HireMind-AI\\frontend\\src\\pages"

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # We want to find patterns like:
    # useEffect(() => { fetchSomething(); }, []);
    # const fetchSomething = async () => { ... };
    
    # Actually, the simplest fix is to replace `const fetchX = async () =>` with `async function fetchX()`
    # because standard functions are hoisted.
    
    # Regex to find: const someFunc = async (args) => {
    # and replace with: async function someFunc(args) {
    
    # Wait, if we replace `const xxx = async (...) => {` with `async function xxx(...) {`, 
    # it completely solves the temporal dead zone problem!
    
    # Let's match `const fetch` or similar functions that we know are causing it. 
    # Let's just match `const ([a-zA-Z0-9_]+) = async \((.*?)\) => {`
    # and replace with `async function \1(\2) {`
    
    new_content = re.sub(
        r"const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\((.*?)\)\s*=>\s*\{",
        r"async function \1(\2) {",
        content
    )
    
    # Also fix non-async `const updateStatus = (id) => {`
    # but let's just stick to async first as it's the most common for fetch.
    
    # What about `const handleDragEnd = (appId, newStatus) => {` ?
    new_content = re.sub(
        r"const\s+([a-zA-Z0-9_]+)\s*=\s*\((.*?)\)\s*=>\s*\{",
        r"function \1(\2) {",
        new_content
    )

    if new_content != content:
        print(f"Fixed {filepath}")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            fix_file(os.path.join(root, file))
