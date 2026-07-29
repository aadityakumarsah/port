import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

imports = """
import shipdLogo from "./public/shipd.png";
import echoLogo from "./public/echo.png";
import deltaLogo from "./public/delta.png";
import digitalNirmanLogo from "./public/digitalnirman.png";
import cogneeLogo from "./public/cogne.png";
import modelenceLogo from "./public/modelence.png";
import metaLogo from "./public/meta.png";
import openClawLogo from "./public/openclaw.png";
import shipSecLogo from "./public/shipsec.png";
import kiloCodeLogo from "./public/kilo.png";
"""

if "import shipdLogo" not in content:
    content = content.replace('import ycLogo from "./public/yc.png";', 'import ycLogo from "./public/yc.png";' + imports)

replacements = {
    '<Ship size={16} className="text-indigo-500" />': '<img src={shipdLogo} alt="Shipd" className="h-4 w-4 rounded-sm" />',
    '<MessageCircle size={16} className="text-pink-500" />': '<img src={echoLogo} alt="Echo" className="h-4 w-4 rounded-sm" />',
    '<Zap size={16} className="text-yellow-500" /> Delta': '<img src={deltaLogo} alt="Delta Electronics" className="h-4 w-4 rounded-sm" /> Delta',
    '<Code2 size={16} className="text-blue-500" /> Digital Nirman': '<img src={digitalNirmanLogo} alt="Digital Nirman" className="h-4 w-4 rounded-sm" /> Digital Nirman',
    
    '<Brain size={14} className="inline text-purple-500 mx-0.5"/>': '<img src={cogneeLogo} alt="Cognee" className="h-3.5 w-3.5 inline-block rounded-sm mx-0.5 align-middle" />',
    '<Terminal size={14} className="inline text-green-500 mx-0.5"/>': '<img src={modelenceLogo} alt="Modelence" className="h-3.5 w-3.5 inline-block rounded-sm mx-0.5 align-middle" />',
    '<Globe size={14} className="inline text-blue-600 mx-0.5"/>': '<img src={metaLogo} alt="Meta" className="h-3.5 w-3.5 inline-block rounded-sm mx-0.5 align-middle" />',
    '<Code2 size={14} className="inline text-orange-500 mx-0.5"/>': '<img src={openClawLogo} alt="OpenClaw" className="h-3.5 w-3.5 inline-block rounded-sm mx-0.5 align-middle" />',
    '<Shield size={14} className="inline text-red-500 mx-0.5"/>': '<img src={shipSecLogo} alt="ShipSec" className="h-3.5 w-3.5 inline-block rounded-sm mx-0.5 align-middle" />',
    '<Zap size={14} className="inline text-yellow-500 mx-0.5"/>': '<img src={kiloCodeLogo} alt="KiloCode" className="h-3.5 w-3.5 inline-block rounded-sm mx-0.5 align-middle" />',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

