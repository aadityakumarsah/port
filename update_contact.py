import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove contact block from header
contact_block_pattern = r'\{\/\* Contact & Socials \*\/\}.*?<\/div>\s*<\/header>'
content = re.sub(contact_block_pattern, '</header>', content, flags=re.DOTALL)

# 2. Add footer at the end of main
footer_content = """
            </section>

          </main>
          
          {/* Footer Contacts */}
          <footer className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-6 pb-12">
            <div className="flex flex-wrap justify-center gap-8 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
              <a href="mailto:shahsudha259@gmail.com" className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Mail size={18} />
                <span>shahsudha259@gmail.com</span>
              </a>
              <a href="tel:+9779827068776" className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Phone size={18} />
                <span>+977 9827068776</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>Biratnagar, Nepal</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
              <a href="https://github.com/aadityakumarsah" className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors" target="_blank" rel="noreferrer">
                <GitBranch size={18} />
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com/in/aadityakumarsah" className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors" target="_blank" rel="noreferrer">
                <Globe size={18} />
                <span>LinkedIn</span>
              </a>
              <a href="https://x.com/aadityakumarsa" className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                <span>X</span>
              </a>
            </div>
          </footer>
        </div>
"""
content = content.replace('            </section>\n\n          </main>\n        </div>', footer_content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

