import { Command } from 'commander'
import { resolve, join } from 'node:path'
import { existsSync } from 'node:fs'
import { startServer } from './server.js'

const program = new Command()
  .name('agentflow-devcon')
  .description('AI Agent First Dev Console')
  .version('0.0.0')
  .argument('[path]', 'project root', '.')
  .option('-p, --port <port>', 'server port', '4170')
  .action(async (path: string, opts: { port: string }) => {
    const root = resolve(path)
    const agentflowDir = join(root, '.agentflow')
    if (!existsSync(agentflowDir)) {
      console.error('.agentflow/ not found. Run: npx agentflow-devcon init')
      process.exit(1)
    }
    await startServer({
      root,
      port: parseInt(opts.port),
    })
  })

program
  .command('init [path]')
  .description('Initialize .agentflow scaffold in a project')
  .action(async (path = '.') => {
    const root = resolve(path)
    console.log(`Initializing .agentflow in ${root}`)
    // TODO: scaffoldAgentflow(root)
  })

program.parse()
