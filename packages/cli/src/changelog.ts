import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYAML } from 'yaml'
import type { ChangelogEntry } from '@agentflow-devcon/shared'

export function readChangelog(processDir: string, itemId: string): ChangelogEntry[] {
  const changelogPath = join(processDir, 'items', `${itemId}.changelog.yaml`)
  if (!existsSync(changelogPath)) return []

  try {
    const content = readFileSync(changelogPath, 'utf-8')
    const data = parseYAML(content) as { entries?: ChangelogEntry[] }
    return data?.entries ?? []
  } catch {
    return []
  }
}
