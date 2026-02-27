import api from './api'

interface PresignResponse {
  uploadUrl: string
  publicUrl: string
}

async function presign(filename: string, contentType: string): Promise<PresignResponse> {
  const params = new URLSearchParams({ filename, contentType })
  return api.post<PresignResponse>(`/images/presign?${params}`).then(r => r.data)
}

export const imageService = {
  async upload(file: File): Promise<string> {
    const { uploadUrl, publicUrl } = await presign(file.name, file.type || 'image/jpeg')
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'image/jpeg' },
    })
    return publicUrl
  },
}
