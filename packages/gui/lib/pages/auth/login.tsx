import Head from "next/head";
import { useRouter } from "next/router";

import { DataGrid } from "@material-ui/data-grid";

import React, { useEffect, useState } from "react";
import { Button, CircularProgress, Grid, Input } from "@material-ui/core";
import { LoginForm } from "../../components/LoginForm/LoginForm";

const columns = [
  { field: "id", headerName: "Name" },
  { field: "modified", headerName: "Modified" },
  { field: "added", headerName: "Added" },
  { field: "size", headerName: "Size" },
];

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Head>
        <title>droppy - login</title>

        <link
          rel="icon"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABwUlEQVR4Ae2XA/McMQBH94PUtt1hrWExqG3btm3b9ulv27aNM3699GwlV76ZdfCyMUdot+h7q7aLvj/RXsu0BxgfZSSv9su+tuQI5KbdIl6tTUDmB6/2pwSxoZnwyJ0h2Pc0w62wJG+O5m/vtUqI7LJmaDTAwgvx7sQp5Whl3mExD7yEShholqowZneoy3jUBC58zIU1eRVi9FkjZC+w4moiHCFKqkbHJTx2AhP3hUMiV8EZV77ksRHov06E4mop3GHV9US6Ap2W8hCeUQt3kSrUmLQ/nJ4AaeGHX2QaDkMPsKCiXmYRZuW1RHa9YP/TDFiTWtRoG/aPE7j5vQCPAootDtLy/SbQKFHCmsWXbIfZ/wL/BWacirFprCffZLMXcP/4UwS23E2xGD5lCjWseRFSYhFmyMZAegJzz8VCrdHAXV6FldKvgqMvs+AOCXkN6Lqcz6YNvIssgzMqG+QYuimQXSPspi1ZckEj7KFQqjHlaCT7XjB8cxCqG+WwZuu9VP91w2nHoqBUaWDgvrCI6g7JrY3JjgdpIJAlGFmKURQodXtrdvpdDgasD6BaepL3r9+cGnbI+j9R6ofMS8235z8AEfZJkM4PeAwAAAAASUVORK5CYII="
        />
        <link
          rel="icon"
          href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9IiMyNmIiIHJ4PSI2NCIgcnk9IjY0Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTM4MSAyOThoLTg0VjE2N2gtNjZMMzM5IDM1bDEwOCAxMzJoLTY2em0tMTY4LTg0aC04NHYxMzFINjNsMTA4IDEzMiAxMDgtMTMyaC02NnoiLz48L3N2Zz4="
        />
      </Head>

      <div className="App">
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: "100vh" }}
        >
          <Grid item xs={3}>
            <LoginForm />
          </Grid>
        </Grid>
      </div>
    </>
  );
}
