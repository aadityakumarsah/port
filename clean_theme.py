import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacements = {
    'bg-[#F5F5EE] dark:bg-black': 'bg-black',
    'bg-[#F5F5EE]/75 dark:bg-black/75': 'bg-black/75',
    'text-zinc-900 dark:text-white': 'text-white',
    'text-zinc-800 dark:text-zinc-200': 'text-zinc-200',
    'text-zinc-700 dark:text-zinc-300': 'text-zinc-300',
    'text-zinc-600 dark:text-zinc-400': 'text-zinc-400',
    'bg-zinc-100/40 dark:bg-zinc-900/40': 'bg-zinc-900/40',
    'bg-zinc-100/80 dark:bg-zinc-900/80': 'bg-zinc-900/80',
    'bg-zinc-200/50 dark:bg-zinc-800/50': 'bg-zinc-800/50',
    'border-zinc-200 dark:border-zinc-800': 'border-zinc-800',
    'border-zinc-300 dark:border-zinc-700': 'border-zinc-700',
    'text-indigo-500 dark:text-indigo-400': 'text-indigo-400',
    'bg-indigo-500/10 dark:bg-indigo-500/20': 'bg-indigo-500/20',
    'text-indigo-600 dark:text-indigo-300': 'text-indigo-300',
    'hover:text-zinc-900 dark:hover:text-white': 'hover:text-white',
    ' cursor-pointer hover:opacity-80 transition-opacity': '',
    ' onClick={() => setIsDark(!isDark)} title="Toggle Theme"': '',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Remove the isDark state and its useEffect
state_effect_pattern = r'\s*const \[isDark, setIsDark\] = useState\(false\);\s*useEffect\(\(\) => \{\s*if \(isDark\) \{\s*document\.documentElement\.classList\.add\("dark"\);\s*\} else \{\s*document\.documentElement\.classList\.remove\("dark"\);\s*\}\s*\}, \[isDark\]\);\s*'
content = re.sub(state_effect_pattern, '\n\n  ', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/index.css', 'r') as f:
    css = f.read()

css = css.replace('bg-[#F5F5EE] dark:bg-black text-zinc-700 dark:text-zinc-300;', 'bg-black text-zinc-300;')

with open('src/index.css', 'w') as f:
    f.write(css)

print("Theme cleaned up successfully.")
