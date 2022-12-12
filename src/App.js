import { useEffect, useState } from "react";

import './styles.css';


export const App = () => {
  const search = window.location.search;
  const query = new URLSearchParams(search);
  const width = Number(query.get('width'));
  const height = Number(query.get('height'));
  const cols = Array.from({ length: width }, (v, k) => `col: ${k}`);
  const grid = Array.from({ length: height }, (v, k) => cols);

  return (
    <div>
      <div className='controls'>
        <button data-merge-button>Merge</button>
        <button data-separate-button>Separate</button>
      </div>
      <table>
        <tbody>
          {grid.map((gridRow, rowIndex) => (
            <tr key={rowIndex}>
              {gridRow.map((gridCell, colIndex) => (
                <td
                  data-selected={false}
                  data-row-index={rowIndex}
                  data-col-index={colIndex}
                  key={colIndex}
                  colSpan={1}
                  rowSpan={1}
                >
                  row: {rowIndex} {gridCell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
