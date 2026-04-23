



export async function guestDelete(id: string) {
  return fetch(import.meta.env.VITE_API_URL + '/api/guests/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ _id: id })
  })
}
export async function guestClearEvents(id: string) {
  return fetch(import.meta.env.VITE_API_URL + '/api/guests/clear-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ _id: id })
  })
}