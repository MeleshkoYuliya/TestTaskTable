import { useEffect, useState } from "react";

import './styles.css';


export const App = () => {
  const search = window.location.search;
  const query = new URLSearchParams(search);
  const width = Number(query.get('width'));
  const height = Number(query.get('height'));
  const cols = Array.from({ length: width }, (v, k) => `col: ${k}`);
  const grid = Array.from({ length: height }, (v, k) => cols);
  const [startSelection, setStartSelection] = useState(false);
  const [selectedCols, setSelectedCols] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [startCell, setStartCell] = useState(null);

  const handleSelect = (currCell) => {
    if (startSelection) {
      let startColIndex;
      let endColIndex;
      let startRowIndex;
      let endRowIndex;

      if (
        startCell && currCell
      ) {
        if (startCell?.colIndex < currCell?.colIndex) {
          startColIndex = startCell.colIndex;
          endColIndex = currCell.colIndex;
        } else {
          startColIndex = currCell.colIndex;
          endColIndex = startCell.colIndex;
        }
  
        if (startCell?.rowIndex < currCell?.rowIndex) {
          startRowIndex = startCell.rowIndex;
          endRowIndex = currCell.rowIndex;
        } else {
          startRowIndex = currCell.rowIndex;
          endRowIndex = startCell.rowIndex;
        }
  
        let colsIndex = Array.from({ length: endColIndex + 1 }, (v, k) => k);
        colsIndex = colsIndex.slice(startColIndex);
        setSelectedCols(colsIndex);
  
        let rowsIndex = Array.from({ length: endRowIndex + 1 }, (v, k) => k);
        rowsIndex = rowsIndex.slice(startRowIndex);
        setSelectedRows(rowsIndex);
      }

    }
  }

  return (
    <div>
      <div className='controls'>
        <button data-merge-button>Merge</button>
        <button data-separate-button>Separate</button>
      </div>
      <table onMouseLeave={() => setStartSelection(false)}>
        <tbody>
          {grid.map((gridRow, rowIndex) => (
            <tr key={rowIndex}>
              {gridRow.map((gridCell, colIndex) => {
                const isCellSelected = selectedCols.includes(colIndex) && selectedRows.includes(rowIndex);
  
                return (
                  <td
                    className={isCellSelected ? 'cell-selected' : ''}
                    data-selected={false}
                    data-row-index={rowIndex}
                    data-col-index={colIndex}
                    key={colIndex}
                    colSpan={1}
                    rowSpan={1}
                    onMouseDown={(e) => {
                      setSelectedCols([]);
                      setSelectedRows([]);
                      setStartSelection(true);
                      setStartCell({colIndex, rowIndex});
                    }}
                    onMouseUp={() => setStartSelection(false)}
                    onMouseMove={() => {
                      if(startSelection) {
                        handleSelect({colIndex, rowIndex})
                      }
                    }}
                  >
                    row: {rowIndex} {gridCell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
