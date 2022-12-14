import { useEffect, useState, useReducer } from "react";
import _ from "lodash";
import { handleGetSelection } from "../utils/tableHandlers";

import './styles.css';


export const MyTable = () => {
    const search = window.location.search;
    const query = new URLSearchParams(search);
    const width = Number(query.get('width'));
    const height = Number(query.get('height'));

    const [startSelection, setStartSelection] = useState(false);
    const [{ startCell, endCell }, setState] = useReducer((state, action) => ({ ...state, ...action }), {
        startCell: null,
        endCell: null,
    });
    const [grid, setGrid] = useState([]);
    const [selection, setSelection] = useState(null);

    const isSelected = (cell) => {
        if (selection) {
            const { start, end } = selection;
            if (cell.row >= start.row && cell.row <= end.row) {
                return cell.col >= start.col && cell.col <= end.col;
            }
        }
        return false;
    };


    const handleMouseDown = (e) => {
        const { tagName, dataset: { rowIndex, colIndex } } = e.target;
        if (tagName === "TD") {
            const row = Number(rowIndex);
            const col = Number(colIndex);
            setState({ startCell: { row, col }, endCell: { row, col }});
            setStartSelection(true);
        }
    };

    const handleMouseUp = () => {
        setStartSelection(false);
    };

    const handleMouseMove = (e) => {
        const { tagName, dataset: { rowIndex, colIndex } } = e.target;
        if (tagName === "TD" && startSelection) {
            const row = Number(rowIndex);
            const col = Number(colIndex);
            setState({ endCell: { row, col }});
        }
    };

    const handleMergeCells = () => {
        const { start, end } = selection;
        const firstCell = grid[start.row][start.col];
        firstCell.colSpan = end.col - start.col + 1;
        firstCell.rowSpan = end.row - start.row + 1;
        const newGrid = [...grid];

        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                if (!_.isEqual(firstCell, newGrid[row][col])) {
                    newGrid[row][col].parent = firstCell;
                }
            }
        }
        setGrid(newGrid);
    };

    const handleSeparateCells = () => {
        const { start, end } = selection;
        const newGrid = [...grid];

        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                newGrid[row][col].parent = null;
                newGrid[row][col].colSpan = 1;
                newGrid[row][col].rowSpan = 1;
            }
        }
        setGrid(newGrid);
    };

    useEffect(() => {
        if (width && height) {
            const cols = Array.from({ length: width }, (v, k) => ({ visible: true, col: k, colSpan: 1, rowSpan: 1, parent: null }));
            const rows = Array.from({ length: height }, (v, k) => cols.map((col) => ({ ...col, row: k })));
            setGrid(rows);
        }
    }, [width, height]);

    useEffect(() => {
        if (startCell && endCell) {
            setSelection(handleGetSelection(startCell, endCell, grid));
        }
    }, [startCell, endCell, grid]);

    return (
        <div>
            <div className='controls'>
                <button data-merge-button onClick={handleMergeCells}>Merge</button>
                <button data-separate-button onClick={handleSeparateCells}>Separate</button>
            </div>
            <table onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
                <tbody>
                    {grid.map((gridRow, rowIndex) => (
                        <tr key={rowIndex}>
                            {gridRow.map((gridCell, colIndex) => {
                                if (gridCell.parent) {
                                    return null;
                                }
                                return (
                                    <td
                                        data-selected={isSelected(gridCell)}
                                        data-row-index={gridCell.row}
                                        data-col-index={gridCell.col}
                                        colSpan={gridCell.colSpan}
                                        rowSpan={gridCell.rowSpan}
                                        key={`${colIndex} - ${rowIndex}`}
                                    >
                                        row: {gridCell.rowIndex} col {gridCell.colIndex}
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
