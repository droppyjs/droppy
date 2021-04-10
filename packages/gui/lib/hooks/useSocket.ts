import { useEffect, useState } from "react";
import { Subject } from "rxjs";
import { w3cwebsocket as W3CWebSocket } from "websocket";

export function useSocket(): [ Subject<any>, CallableFunction, CallableFunction ] {
  const [ listener ] = useState(new Subject<any>())
  const [ socket, setSocket ] = useState<W3CWebSocket>(null);
  const [ token, realSetToken ] = useState<string>(null);

  const setToken = (token: string) => {
    realSetToken(token);

    if (!socket) {
      const newSocket = new W3CWebSocket(`ws://${location.hostname}:8989`);
      
      newSocket.onmessage = ({data}) => {
        listener.next(JSON.parse(data.toString()));
      }

      setSocket(newSocket);      
    }
  };

  const sendMessage = (message: any) => {
    if (socket) {
      if (socket.readyState !== 1) {
        setTimeout(() => sendMessage(message), 500);
        return;
      }
      socket.send(JSON.stringify({
        ...message,
        token,
      }));
    }
  }


  return [listener, sendMessage, setToken];
}
