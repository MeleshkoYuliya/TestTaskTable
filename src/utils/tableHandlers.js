export const  updateSelection = (start, end, grid) => {
    const prevSelection = JSON.stringify({ start, end });

    for (let row = start.row; row <= end.row; row++) {
        for (let col = start.col; col <= end.col; col++) {
            end.col = Math.max(end.col, col + grid[row][col].colSpan - 1);
            end.row = Math.max(end.row, row + grid[row][col].rowSpan - 1);
            if (grid[row][col].parent) {
                start.col = Math.min(start.col, grid[row][col].parent.col);
                start.row = Math.min(start.row, grid[row][col].parent.row);
            }
        }
    }

    if (prevSelection !== JSON.stringify({ start, end })) {
        updateSelection(start, end, grid);
    }

    return { start, end };
}

export const handleGetSelection = (start, end, grid) => {
    const startCell = {
        row: Math.min(start.row, end.row),
        col: Math.min(start.col, end.col),
    };

    const endCell = {
        row: Math.max(start.row, end.row),
        col: Math.max(start.col, end.col),
    };

    return updateSelection(startCell, endCell, grid);
};
