import { cpSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function scaffoldAgentflow(root: string) {
  const target = join(root, '.agentflow')

  if (existsSync(target)) {
    console.error('.agentflow/ already exists. Aborting.')
    process.exit(1)
  }

  // Templates are bundled alongside dist/ — resolve from package root
  const templateDir = join(__dirname, '..', 'templates')

  if (!existsSync(templateDir)) {
    console.error('Template directory not found. Package may be corrupted.')
    process.exit(1)
  }

  cpSync(templateDir, target, { recursive: true })

  console.log('Created .agentflow/ with:')
  console.log('  ├── flow.yaml')
  console.log('  ├── AGENTS.md')
  console.log('  └── lanes/')
  console.log('       ├── define/  (problem, prd, stories)')
  console.log('       ├── design/  (design-system, components, contracts)')
  console.log('       ├── develop/ (prototype, e2e)')
  console.log('       └── verify/  (harness, development, verification)')
  console.log('')
  console.log('Next: npx agentflow-devcon')
}
