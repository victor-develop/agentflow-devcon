import { cpSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function scaffoldAgentflow(root: string, prompt?: string) {
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

  if (!prompt) {
    console.log('')
    console.log('Next: agentflow-devcon .')
    console.log('Tip:  agentflow-devcon init -p "Build an OMS MVP" to auto-populate with AI')
    return
  }

  // ── AI scaffold: call Claude CLI to populate the project ──
  console.log('')
  console.log(`Scaffolding project with AI: "${prompt}"`)
  console.log('')

  const agentsmd = readFileSync(join(target, 'AGENTS.md'), 'utf-8')

  // Collect all schema files for context
  const schemaContext: string[] = []
  collectSchemas(target, target, schemaContext)

  const fullPrompt = [
    agentsmd,
    '',
    '## Available Schemas',
    ...schemaContext,
    '',
    '## Task',
    `Scaffold a complete project based on this description: "${prompt}"`,
    '',
    'Create a realistic set of items across ALL workflow steps:',
    '1. 2-3 Problems with evidence and hypotheses',
    '2. 1-2 PRDs linked to problems (create relations!)',
    '3. 5-8 Stories broken down from the PRDs (create relations!)',
    '4. 5-10 Design Components linked to stories (create relations!)',
    '5. 3-5 API Contracts linked to stories (create relations!)',
    '6. 3-5 E2E test cases linked to stories (create relations!)',
    '',
    'IMPORTANT:',
    '- Create ALL relation files in .agentflow/relations/',
    '- Use realistic, detailed content — not placeholder text',
    '- Follow the ID format from each schema (e.g., PROB-001, PRD-001, STORY-001, COMP-001)',
    '- Make the items interconnected and coherent as a real project',
  ].join('\n')

  const bin = process.env.CLAUDE_BIN || 'claude'

  await new Promise<void>((resolve, reject) => {
    const child = spawn(bin, [
      '--dangerously-skip-permissions',
      '-p',
      fullPrompt,
    ], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, TERM: 'dumb' },
    })

    child.stdout!.on('data', (data: Buffer) => {
      process.stdout.write(data)
    })

    child.stderr!.on('data', (data: Buffer) => {
      process.stderr.write(data)
    })

    child.on('close', (code) => {
      if (code === 0) {
        console.log('')
        console.log('Scaffold complete! Run: agentflow-devcon .')
        resolve()
      } else {
        console.error(`\nClaude CLI exited with code ${code}`)
        console.error('The .agentflow/ directory was created but may be incomplete.')
        console.error('You can populate it manually or re-run with: claude')
        reject(new Error(`Claude exited with code ${code}`))
      }
    })

    child.on('error', (err) => {
      console.error(`\nFailed to run Claude CLI: ${err.message}`)
      console.error('Make sure claude is installed: npm install -g @anthropic-ai/claude-code')
      console.error('The .agentflow/ directory was created with empty schemas.')
      reject(err)
    })
  })
}

function collectSchemas(dir: string, root: string, out: string[]) {
  const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs')
  const { relative } = require('node:path') as typeof import('node:path')

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      collectSchemas(full, root, out)
    } else if (entry === 'schema.yaml') {
      const rel = relative(root, full)
      const content = readFileSync(full, 'utf-8')
      out.push(`\n### ${rel}\n\`\`\`yaml\n${content}\`\`\``)
    }
  }
}
