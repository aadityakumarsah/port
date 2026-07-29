import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
import_statement = 'import ycLogo from "./public/yc.png";\n'
if import_statement not in content:
    content = content.replace('import "./index.css";', import_statement + 'import "./index.css";')

replacements = {
    '<span className="font-bold text-[#FF6600]">YC W24</span>': '<span className="inline-flex items-center gap-1 font-bold text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-4 w-4 rounded-sm" />YC W24</span>',
    '<span className="font-bold text-[#FF6600]">YC W24</span>': '<span className="inline-flex items-center gap-1 font-bold text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-4 w-4 rounded-sm" />YC W24</span>',
    '<span className="text-[#FF6600] font-bold">YC</span>': '<span className="inline-flex items-center gap-1 text-[#FF6600] font-bold"><img src={ycLogo} alt="YC" className="h-3.5 w-3.5 rounded-sm" />YC</span>',
    '<span className="text-[#FF6600]">YC W25</span>': '<span className="inline-flex items-center gap-1 text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-3.5 w-3.5 rounded-sm" />YC W25</span>',
    '<span className="text-[#FF6600]">YC S25</span>': '<span className="inline-flex items-center gap-1 text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-3.5 w-3.5 rounded-sm" />YC S25</span>',
    '<span className="font-bold text-[#FF6600]">Y Combinator</span>': '<span className="inline-flex items-center gap-1 font-bold text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-4 w-4 rounded-sm" />Y Combinator</span>',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

