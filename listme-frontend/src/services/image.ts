import api from './api'

interface PresignResponse {
  uploadUrl: string
  publicUrl: string
}

export const imageService = {
  async upload(file: File): Promise<string> {
    const params = new URLSearchParams({ filename: file.name })
    const { uploadUrl, publicUrl } = await api
      .post<PresignResponse>(`/images/presign?${params}`)
      .then(r => r.data)
    await fetch(uploadUrl, { method: 'PUT', body: file })
    return publicUrl
  },
}
