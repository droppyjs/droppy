export function getToken() {
    return fetch(`${window.location.protocol}//${window.location.hostname}:8989/!/token`, {
      headers: {
        'x-app': 'droppy'
      },
      credentials: "include"
    })
    .then(data => data.text())
    .catch(() => null)
  }