import {useEffect, useState} from "react"
import TokenData from "../models/token/TokenData"
import TokenStatus from "../models/token/TokenStatus"
import {getToken} from "../services/auth/getToken"

export function useToken(): [TokenData, CallableFunction] {
  const [token, setToken] = useState<TokenData>({
    status: TokenStatus.Loading,
  })

  useEffect(() => {
    void getToken().then((token) => {
      if (!token) {
        setToken({
          token: "",
          status: TokenStatus.Invalid,
        })
      } else {
        setToken({
          token,
          status: TokenStatus.Valid,
        })
      }
    })
  }, [])

  return [token, setToken]
}
