import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

export async function analyzeText(content, inputType, options = {}) {
  const response = await client.post('/analyze', {
    input_type: inputType,
    content,
    options: {
      mask: options.mask ?? false,
      block_high_risk: options.blockHighRisk ?? false,
      log_analysis: options.logAnalysis ?? true,
    },
  })
  return response.data
}

export async function analyzeFile(file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mask', options.mask ?? false)
  formData.append('block_high_risk', options.blockHighRisk ?? false)
  formData.append('log_analysis', options.logAnalysis ?? true)

  const response = await client.post('/analyze/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function checkHealth() {
  const response = await client.get('/health')
  return response.data
}
