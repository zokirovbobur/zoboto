/**
 * Copies existing static portfolio assets into public/ before the Next.js build.
 * Files stay at their original locations in git; this script populates public/
 * at build time so Next.js can serve them as static files.
 */
const { cpSync, mkdirSync, existsSync } = require('fs')
const { join } = require('path')

const root = process.cwd()

const items = [
  { src: 'index.html', dest: 'public/index.html' },
  { src: 'assets', dest: 'public/assets' },
  { src: 'prototypes', dest: 'public/prototypes' },
  { src: 'docs', dest: 'public/docs' },
  { src: 'smart-bi', dest: 'public/smart-bi' },
]

mkdirSync(join(root, 'public'), { recursive: true })

for (const { src, dest } of items) {
  const srcPath = join(root, src)
  const destPath = join(root, dest)
  if (!existsSync(srcPath)) {
    console.log(`  skip  ${src} (not found)`)
    continue
  }
  try {
    cpSync(srcPath, destPath, { recursive: true, force: true })
    console.log(`  copy  ${src} → ${dest}`)
  } catch (e) {
    console.warn(`  warn  ${src}: ${e.message}`)
  }
}
