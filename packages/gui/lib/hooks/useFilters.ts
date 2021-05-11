import {useEffect, useState} from "react"
import FilterConfig from "../models/filters/FilterConfig"

/**
 *
 * @returns [ filters: FilterConfig, setSearchString: CallableFunction, setSortColumn]
 */
export function useFilters(): [FilterConfig, CallableFunction, CallableFunction] {
  const [searchFilters, setSearchFilters] = useState<FilterConfig>({})

  const [searchString, setSearchString] = useState()
  const [sortByColumn, setSortColumn] = useState()

  useEffect(() => {
    const searchFilters: FilterConfig = {
      searchString,
      sortByColumn,
    }
    setSearchFilters(searchFilters)
  }, [searchString, sortByColumn])

  return [searchFilters, setSearchString, setSortColumn]
}
