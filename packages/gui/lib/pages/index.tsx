import Head from "next/head"
import {useRouter} from "next/router"

import {DataGrid} from "@material-ui/data-grid"

import {DroppyHeader} from "../components"
import React, {useEffect, useState} from "react"
import {CircularProgress, Grid} from "@material-ui/core"
import {useSocket} from "../hooks/useSocket"
import DroppyAboutDialog from "../components/Dialog/DroppyAbout/DroppyAbout"
import {useSettings} from "../hooks/useSettings"
import {useToken} from "../hooks/useToken"
import TokenStatus from "../models/token/TokenStatus"
import {useFilters} from "../hooks/useFilters"
import Breadcrumbs from "@material-ui/core/Breadcrumbs"
import Link from "@material-ui/core/Link"
import HomeIcon from "@material-ui/icons/Home"
import {FolderSpecialOutlined} from "@material-ui/icons"
import {DroppyTable} from "../components/DroppyTable/DroppyTable"

const columns = {
  id: "Name",
  modified: "Modified",
  added: "Added",
  size: "Size",
}

export default function Home() {
  const router = useRouter()

  const [aboutOpen, setAboutOpen] = useState(false)
  const [listener, sendMessage, setToken] = useSocket()
  const [tokenData] = useToken()
  const [settings, setSettings] = useSettings()
  const [filters, setSearchString, setSortColumn] = useFilters()
  const [directory, setDirectory] = useState("/")
  const [rows, setRows] = useState(null)

  listener.subscribe((message) => {
    //    console.log("Incoming Message:", message)
    switch (message.type) {
      case "SETTINGS":
        setSettings(message.settings)
        break
      case "UPDATE_DIRECTORY":
        let newRows = []

        for (const name in message.data) {
          const [type, modified, size, created] = message.data[name].split("|")
          newRows.push({id: name, modified, added: created, size: size, type})
        }
        setRows(newRows)
        break
    }
  })

  useEffect(() => {
    if (tokenData.status === TokenStatus.Invalid) {
      void router.push("/auth/login")
      return
    }
    setToken(tokenData)
  }, [tokenData, router, setToken])

  useEffect(() => {
    if (rows === null) {
      sendMessage({type: "REQUEST_UPDATE", data: directory})
    }
  }, [rows, directory, sendMessage])

  useEffect(() => {
    sendMessage({type: "REQUEST_UPDATE", data: directory})
  }, [directory])

  const handleHashChange = () => {
    const path = window.location.hash.substr(1)
    if (path) {
      console.log("set path to " + path)
      setDirectory(path)
    } else {
      setDirectory("/")
    }
  }

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  if (tokenData.status !== TokenStatus.Valid) {
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{minHeight: "100vh"}}
      >
        <Grid item xs={3}>
          <CircularProgress />
        </Grid>
      </Grid>
    )
  }

  const handleRowClick = (row) => {
    if (row.type === "d") {
      setDirectory(directory + row.id)
    }
  }

  return (
    <>
      <Head>
        <title>droppy</title>

        <link
          rel="icon"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABwUlEQVR4Ae2XA/McMQBH94PUtt1hrWExqG3btm3b9ulv27aNM3699GwlV76ZdfCyMUdot+h7q7aLvj/RXsu0BxgfZSSv9su+tuQI5KbdIl6tTUDmB6/2pwSxoZnwyJ0h2Pc0w62wJG+O5m/vtUqI7LJmaDTAwgvx7sQp5Whl3mExD7yEShholqowZneoy3jUBC58zIU1eRVi9FkjZC+w4moiHCFKqkbHJTx2AhP3hUMiV8EZV77ksRHov06E4mop3GHV9US6Ap2W8hCeUQt3kSrUmLQ/nJ4AaeGHX2QaDkMPsKCiXmYRZuW1RHa9YP/TDFiTWtRoG/aPE7j5vQCPAootDtLy/SbQKFHCmsWXbIfZ/wL/BWacirFprCffZLMXcP/4UwS23E2xGD5lCjWseRFSYhFmyMZAegJzz8VCrdHAXV6FldKvgqMvs+AOCXkN6Lqcz6YNvIssgzMqG+QYuimQXSPspi1ZckEj7KFQqjHlaCT7XjB8cxCqG+WwZuu9VP91w2nHoqBUaWDgvrCI6g7JrY3JjgdpIJAlGFmKURQodXtrdvpdDgasD6BaepL3r9+cGnbI+j9R6ofMS8235z8AEfZJkM4PeAwAAAAASUVORK5CYII="
        />
        <link
          rel="icon"
          href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9IiMyNmIiIHJ4PSI2NCIgcnk9IjY0Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTM4MSAyOThoLTg0VjE2N2gtNjZMMzM5IDM1bDEwOCAxMzJoLTY2em0tMTY4LTg0aC04NHYxMzFINjNsMTA4IDEzMiAxMDgtMTMyaC02NnoiLz48L3N2Zz4="
        />
      </Head>

      <DroppyHeader handleAbout={() => setAboutOpen(true)} />

      <Breadcrumbs aria-label="breadcrumb">
        {directory.split("/").map((part, i) => {
          if (i === 0) {
            return (
              <Link color="inherit" key={i} href={"/#/"} onClick={() => setDirectory("/")}>
                <HomeIcon />
              </Link>
            )
          }
          if (part === "") {
            return <span key={i}></span>
          }
          return (
            <Link color="inherit" href="/getting-started/installation/" key={i}>
              <FolderSpecialOutlined />
              {part}
            </Link>
          )
        })}
      </Breadcrumbs>

      <div style={{height: "85vh", width: "100%"}}>
        <DroppyTable rows={rows} columns={columns} onRowClick={handleRowClick} />
      </div>

      <DroppyAboutDialog
        settings={settings}
        open={aboutOpen}
        handleClose={() => setAboutOpen(false)}
      />
    </>
  )
}
