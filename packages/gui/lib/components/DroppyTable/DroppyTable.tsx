import {AutoSizer, Column, Table} from "react-virtualized"
import Draggable from "react-draggable"
import {useState} from "react"
import {DroppyTableProps} from "./DroppyTable.types"
import React from "react"

export function DroppyTable({rows, columns, onRowClick}: DroppyTableProps) {
  const [widths, setWidths] = useState(
    Object.keys(columns).reduce((current, key) => {
      current[key] = 100 / Object.keys(columns).length / 100
      return current
    }, {}),
  )

  const resizeRow = ({width, dataKey, deltaX}) => {
    const prevWidths = widths
    const percentDelta = deltaX / 100

    // This is me being lazy :)
    const nextDataKey = dataKey === "name" ? "location" : "description"

    return setWidths({
      ...prevWidths,
      [dataKey]: prevWidths[dataKey] + percentDelta,
      [nextDataKey]: prevWidths[nextDataKey] - percentDelta,
    })
  }

  const headerRenderer = (
    width,
    columnData,
    dataKey,
    disableSort,
    label,
    sortBy,
    sortDirection,
  ) => {
    return (
      <React.Fragment key={dataKey}>
        <div className="ReactVirtualized__Table__headerTruncatedText">{label}</div>
        <Draggable
          zIndex="999"
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          onDrag={(event, {deltaX}) =>
            this.resizeRow({
              width,
              dataKey,
              deltaX,
            })
          }
          position={{x: 0, y: undefined}}
        >
          <span className="DragHandleIcon">⋮</span>
        </Draggable>
      </React.Fragment>
    )
  }
  if (!rows) {
    return <></>
  }

  return (
    <AutoSizer>
      {({height, width}) => (
        <Table
          width={width}
          height={height}
          headerHeight={20}
          rowHeight={50}
          rowCount={rows.length}
          rowGetter={({index}) => rows[index]}
          onRowClick={({rowData}) => onRowClick && onRowClick(rowData)}
        >
          {Object.keys(columns).map((id) => {
            const label = columns[id]

            return (
              <Column
                key={id}
                dataKey={id}
                label={label}
                width={widths[id] * width}
                headerRenderer={(...args) => {
                  return headerRenderer.apply(null, [width, ...args]) as any
                }}
              />
            )
          })}
        </Table>
      )}
    </AutoSizer>
  )
}
