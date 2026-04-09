import { defineConfig } from 'orval'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const localSchema = resolve(__dirname, 'src', 'api', 'schema.json')
const input = process.env.API_URL || (existsSync(localSchema) ? localSchema : 'http://localhost:3000/v1/docs-json')

export default defineConfig({
  api: {
    input,
    output: {
      target: './src/api/generated.ts',
      client: 'react-query',
      schemas: './src/api/model',
    },
  },
})
