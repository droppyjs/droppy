import {useState} from "react"
import {Subject} from "rxjs"
import {w3cwebsocket as W3CWebSocket} from "websocket"
import TokenData from "../models/token/TokenData"

export function useSocket(): [Subject<any>, CallableFunction, CallableFunction] {
  const [listener] = useState(new Subject<any>())
  const [socket, setSocket] = useState<W3CWebSocket>(null)
  const [token, realSetToken] = useState<TokenData>(null)

  const createSocket = () => {
    const newSocket = new W3CWebSocket(`ws://${window.location.hostname}:8989/!/socket`)

    newSocket.onmessage = ({data}) => {
      listener.next(JSON.parse(data.toString()))
    }

    newSocket.onclose = () => {
      setTimeout(createSocket, 500)
    }

    setSocket(newSocket)
  }

  const setToken = (token: TokenData) => {
    realSetToken(token)

    if (!socket) {
      createSocket()
    }
  }

  const sendMessage = (message: any) => {
    if (socket) {
      if (socket.readyState === 0) {
        return
      }
      if (!token.token) {
        return
      }

      socket.send(
        JSON.stringify({
          ...message,
          token: token.token,
          vId: null,
        }),
      )
    }
  }

  return [listener, sendMessage, setToken]
}
