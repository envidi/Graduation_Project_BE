export function getRowAndCol(totalSeat) {
  switch (totalSeat) {
  case 72:
    return {
      row: 9,
      column: 8
    }
  case 64:
    return {
      row: 8,
      column: 8
    }
  case 56:
    return {
      row: 7,
      column: 8
    }

  default:
    return {
      row: 8,
      column: 8
    }
  }
}
