import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add isDark state
content = content.replace(
    'const [leaves, setLeaves] = useState<LeafParticle[]>([]);',
    'const [leaves, setLeaves] = useState<LeafParticle[]>([]);\n  const [isDark, setIsDark] = useState(false);\n\n  useEffect(() => {\n    if (isDark) {\n      document.documentElement.classList.add("dark");\n    } else {\n      document.documentElement.classList.remove("dark");\n    }\n  }, [isDark]);'
)

# Add click handler to name
content = content.replace(
    '<h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">',
    '<h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsDark(!isDark)} title="Toggle Theme">'
)

# Replace classes
replacements = {
    'bg-[#F5F5EE]': 'bg-[#F5F5EE] dark:bg-black',
    'bg-[#F5F5EE]/75': 'bg-[#F5F5EE]/75 dark:bg-black/75',
    'text-zinc-900': 'text-zinc-900 dark:text-white',
    'text-zinc-800': 'text-zinc-800 dark:text-zinc-200',
    'text-zinc-700': 'text-zinc-700 dark:text-zinc-300',
    'text-zinc-600': 'text-zinc-600 dark:text-zinc-400',
    'bg-zinc-100/40': 'bg-zinc-100/40 dark:bg-zinc-900/40',
    'bg-zinc-100/80': 'bg-zinc-100/80 dark:bg-zinc-900/80',
    'bg-zinc-200/50': 'bg-zinc-200/50 dark:bg-zinc-800/50',
    'bg-zinc-300': 'bg-zinc-300 dark:bg-zinc-700',
    'border-zinc-200': 'border-zinc-200 dark:border-zinc-800',
    'border-zinc-300': 'border-zinc-300 dark:border-zinc-700',
    'text-indigo-400': 'text-indigo-500 dark:text-indigo-400',
    'bg-indigo-500/10': 'bg-indigo-500/10 dark:bg-indigo-500/20',
    'text-indigo-300': 'text-indigo-600 dark:text-indigo-300',
}

# Apply replacements carefully
# First protect the replacements we've already done for the toggle
# Then apply to the rest

for old, new in replacements.items():
    content = content.replace(old, new)

# Since we replaced text-zinc-900 twice for the h1, fix it:
content = content.replace('text-zinc-900 dark:text-white dark:text-white', 'text-zinc-900 dark:text-white')

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/index.css', 'r') as f:
    css = f.read()
    
css = css.replace(
    '@apply min-h-screen relative m-0 bg-[#F5F5EE] text-zinc-700;',
    '@apply min-h-screen relative m-0 bg-[#F5F5EE] dark:bg-black text-zinc-700 dark:text-zinc-300;'
)

with open('src/index.css', 'w') as f:
    f.write(css)

