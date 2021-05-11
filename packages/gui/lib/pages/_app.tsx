import {CssBaseline, ThemeProvider} from "@material-ui/core"
import React, {useEffect} from "react"
import theme from "../theme"
import "react-virtualized/styles.css" // only needs to be imported once
import "../style.css" // only needs to be imported once

function MyApp({Component, pageProps}) {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
