export function login(username: string, password: string, remember: boolean) {
    return fetch(`${window.location.protocol}//${window.location.hostname}:8989/!/login`, {
    method: 'POST',
      headers: {
        'x-app': 'droppy'
      },
      body: JSON.stringify({
        username,
        password,
        path: "/",
        remember,
      }),
      credentials: "include"
    })
    .then(data => data.text())
    .catch(() => null)
  }