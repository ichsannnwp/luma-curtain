const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Permintaan gagal.')
  return data
}
