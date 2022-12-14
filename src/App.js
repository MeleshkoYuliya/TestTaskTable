import { useEffect, useState, useMemo, Fragment } from "react";
import _ from "lodash";

import './styles.css';


export const App = () => {
  const search = window.location.search;
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const [startSelection, setStartSelection] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [cells, setCells] = useState([]);
  const [grid, setGrid] = useState([]);

  const handleGetSelectedCells = ({ startColIndex, endColIndex, startRowIndex, endRowIndex }) => {
    const newGrid = grid?.flat().filter((cell, cellIndex) => {

      if (cell.rowIndex >= startRowIndex && cell.rowIndex <= endRowIndex) {
        if (cell.colIndex >= startColIndex && cell.colIndex <= endColIndex) {
          return cell;
        }
        return false;
      }

      return false;
    });

    setCells(newGrid);
  }

  const handleSelect = () => {
    if (startSelection) {
      let startColIndex;
      let endColIndex;
      let startRowIndex;
      let endRowIndex;

      if (
        startCell && endCell
      ) {
        if (startCell?.colIndex < endCell?.colIndex) {
          startColIndex = startCell.colIndex;
          endColIndex = endCell.colIndex;
        } else {
          startColIndex = endCell.colIndex;
          endColIndex = startCell.colIndex;
        }

        if (startCell?.rowIndex < endCell?.rowIndex) {
          startRowIndex = startCell.rowIndex;
          endRowIndex = endCell.rowIndex;
        } else {
          startRowIndex = endCell.rowIndex;
          endRowIndex = startCell.rowIndex;
        }

        grid?.flat().forEach((cell, cellIndex) => {
          if ((cell.rowIndex >= startRowIndex && cell.rowIndex <= endRowIndex) && (cell.colIndex >= startColIndex && cell.colIndex <= endColIndex)) {
            if (cell.rowSpan > 1 && cell.rowIndex < startRowIndex) {
              startRowIndex = cell.rowIndex;
            }
  
            if (cell.colSpan > 1 && cell.colIndex < startColIndex) {
              startColIndex = cell.colIndex;
            }
  
            if (cell.rowSpan > 1 && cell.rowIndex + cell.rowSpan - 1 > endRowIndex) {
              endRowIndex = cell.rowIndex + cell.rowSpan - 1;
            }
  
            if (cell.colSpan > 1 && cell.colIndex + cell.colSpan - 1 > endColIndex) {
              endColIndex = cell.colIndex + cell.colSpan - 1;
            }
          }

          if ((cell.rowIndex >= startRowIndex && cell.rowIndex < endRowIndex) && cell.colSpan > 1 && cell.colIndex + cell.colSpan - 1 === startColIndex) {
            startColIndex = cell.colIndex;
          }
        })

        handleGetSelectedCells({ startColIndex, endColIndex, startRowIndex, endRowIndex });
      }

    }
  }

  const handleMerge = () => {

    const collMax = _.maxBy(cells, 'colIndex').colIndex;
    const collMin = _.minBy(cells, 'colIndex').colIndex;
    const rowMax = _.maxBy(cells, 'rowIndex').rowIndex;
    const rowMin = _.minBy(cells, 'rowIndex').rowIndex;

    const newGrid = grid?.map((row, rowIndex) => {
      const newRow = row.map((cell, cellIndex) => {
        if ((rowIndex > rowMin && rowIndex <= rowMax && cellIndex >= collMin && cellIndex <= collMax)) {
          return { ...cell, visible: false }
        }

        if (rowIndex === rowMin && cellIndex === collMin) {
          return { ...cell, rowSpan: (rowMax - rowMin) + cell?.rowSpan, colSpan: (collMax - collMin) + cell?.colSpan }
        }

        if (rowIndex === rowMin && cellIndex > collMin && cellIndex <= collMax) {
          return { ...cell, visible: false }
        }

        return cell;
      });
      return newRow;
    })
    setGrid(newGrid);
  }

  const handleSeparate = () => {
    const mergedCells = cells?.filter((cell) => cell.colSpan > 1 || cell.rowSpan > 1);
  }

  useEffect(() => {
    const width = Number(query.get('width'));
    const height = Number(query.get('height'));
    const cols = Array.from({ length: width }, (v, k) => ({ visible: true, colIndex: k, colSpan: 1, rowSpan: 1 }));
    const rows = Array.from({ length: height }, (v, k) => cols.map((col) => ({ ...col, rowIndex: k })));
    setGrid(rows);
  }, [query]);

  return (
    <div>
      <div className='controls'>
        <button data-merge-button onClick={handleMerge}>Merge</button>
        <button data-separate-button onClick={handleSeparate}>Separate</button>
      </div>
      <table onMouseLeave={() => setStartSelection(false)}>
        <tbody>
          {grid.map((gridRow, rowIndex) => (
            <tr key={rowIndex}>
              {gridRow.map((gridCell, colIndex) => {
                const isCellSelected = cells?.some((cell) => cell.rowIndex === rowIndex && cell.colIndex === colIndex);

                return (
                  <Fragment key={`${colIndex} - ${rowIndex}`}>
                    {gridCell.visible && (
                      <td
                        data-selected={isCellSelected}
                        data-row-index={rowIndex}
                        data-col-index={colIndex}
                        colSpan={gridCell.colSpan}
                        rowSpan={gridCell.rowSpan}
                        onMouseDown={(e) => {
                          setStartSelection(true);
                          setStartCell({ colIndex, rowIndex, gridCell });
                          setCells([]);
                        }}
                        onMouseUp={() => setStartSelection(false)}
                        onMouseMove={() => {
                          if (startSelection) {
                            setEndCell(gridCell);
                            handleSelect()
                          }
                        }}
                      >
                        row: {gridCell.rowIndex} col {gridCell.colIndex}
                      </td>
                    )}
                  </Fragment>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
