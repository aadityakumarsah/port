import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update Imports
imports = """  Brain,
  Shield,
  MessageCircle,
  Ship,
  Zap,
  Activity,
  Bot,"""
content = content.replace('  ChevronRight,\n  Leaf,', imports + '\n  ChevronRight,\n  Leaf,')

# 2. Update Experience timeline styling
content = content.replace('<div className="group/list space-y-12">', '<div className="group/list relative space-y-16 pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-3">')
# Add a dot to each job
job_dot = '<div className="absolute -left-[31px] mt-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-[#F5F5EE] dark:bg-black z-10"></div>\n                  <header'
content = content.replace('<header', job_dot)

# Remove the extra <header that we might have caught if it wasn't a job header (luckily all headers in this block are job headers, wait, there's <header className="lg:sticky lg:top-0... no, it has class, wait. Let's be precise.
content = content.replace('<div className="absolute -left-[31px] mt-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-[#F5F5EE] dark:bg-black z-10"></div>\n                  <header className="flex flex-col">', '<header className="flex flex-col">')

# 3. Add logos to Experience titles
content = content.replace('<span>Software Engineer · <span className="inline-block">Shipd', '<span className="flex items-center gap-1">Software Engineer · <Ship size={16} className="text-indigo-500" /> <span className="inline-block">Shipd')
content = content.replace('<span>Full-Stack Developer · <span className="inline-block">Echo', '<span className="flex items-center gap-1">Full-Stack Developer · <MessageCircle size={16} className="text-pink-500" /> <span className="inline-block">Echo')
content = content.replace('<span className="text-zinc-800 dark:text-zinc-200 text-base font-medium">Backend Developer · Delta Electronics</span>', '<span className="text-zinc-800 dark:text-zinc-200 text-base font-medium flex items-center gap-1">Backend Developer · <Zap size={16} className="text-yellow-500" /> Delta Electronics</span>')
content = content.replace('<span className="text-zinc-800 dark:text-zinc-200 text-base font-medium">SDE I - Backend · Digital Nirman</span>', '<span className="text-zinc-800 dark:text-zinc-200 text-base font-medium flex items-center gap-1">SDE I - Backend · <Code2 size={16} className="text-blue-500" /> Digital Nirman</span>')

# 4. Highlight BITS Pilani & Add Logos to Achievements
content = content.replace('>BITS Pilani</p>', ' className="font-bold text-indigo-600 dark:text-indigo-400">BITS Pilani</p>')
content = content.replace('Winner, eSewa x WWF Hackathon', 'Winner, <span className="text-emerald-500 font-bold">eSewa x WWF Hackathon</span>')
content = content.replace('OpenAI</span> Build Week', 'OpenAI</span> <Activity size={16} className="inline-block mx-1 text-green-500" /> Build Week')

# 5. Add logos to Open-source line
os_line_old = '<span>Open-source contributor across Cognee, <span className="font-bold text-zinc-900 dark:text-white">Mastra (<span className="text-[#FF6600]">YC W25</span>)</span>, <span className="font-bold text-zinc-900 dark:text-white">Modelence (<span className="text-[#FF6600]">YC S25</span>)</span>, Meta, OpenClaw, ShipSec, and KiloCode; GitHub Developer Program member with 100+ personal projects.</span>'

os_line_new = '<span>Open-source contributor across <Brain size={14} className="inline text-purple-500 mx-0.5"/>Cognee (<span className="text-[#FF6600] font-bold">YC</span>), <Bot size={14} className="inline text-blue-500 mx-0.5"/><span className="font-bold text-zinc-900 dark:text-white">Mastra (<span className="text-[#FF6600]">YC W25</span>)</span>, <Terminal size={14} className="inline text-green-500 mx-0.5"/><span className="font-bold text-zinc-900 dark:text-white">Modelence (<span className="text-[#FF6600]">YC S25</span>)</span>, <Globe size={14} className="inline text-blue-600 mx-0.5"/>Meta, <Code2 size={14} className="inline text-orange-500 mx-0.5"/>OpenClaw, <Shield size={14} className="inline text-red-500 mx-0.5"/>ShipSec, and <Zap size={14} className="inline text-yellow-500 mx-0.5"/>KiloCode; GitHub Developer Program member with 100+ personal projects.</span>'
content = content.replace(os_line_old, os_line_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

