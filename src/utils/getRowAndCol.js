export function getRowAndCol(totalSeat) {
  switch (totalSeat) {
  case 72:
    return {
      row: 8,
      column: 9
    }
  case 64:
    return {
      row: 8,
      column: 8
    }
  case 49:
    return {
      row: 7,
      column: 7
    }

  default:
    return {
      row: 8,
      column: 8
    }
  }
}
