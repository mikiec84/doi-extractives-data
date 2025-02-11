import React from 'react'
import DataAndDocIcon from '-!svg-react-loader!../../img/svg/icon-data-and-docs-circle.svg'

const DataAndDocs = props => (
  <span>
    <DataAndDocIcon />
    {props.children === undefined
      ? 'Downloads and documentation'
      : props.children}
  </span>
)

export default DataAndDocs
