import 'dotenv/config'
import { generateWithUsage, countPromptTokens } from './gemini.client'

async function main() {
  const prompt = 'What is the capital of France?'

  // 1) How "big" the prompt is BEFORE sending it (does not spend generation quota).
  const promptTokens = await countPromptTokens(prompt)
  console.log(`Prompt is ~${promptTokens} tokens`)

  // 2) Generate, then look at what the call actually consumed.
  const { text, usage } = await generateWithUsage(prompt)
  console.log('\nResponse:', text)
  console.log('\nUsage for this call:')
  console.log(`  prompt:   ${usage.prompt} tokens (input)`)
  console.log(`  response: ${usage.response} tokens (output)`)
  console.log(`  total:    ${usage.total} tokens`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
