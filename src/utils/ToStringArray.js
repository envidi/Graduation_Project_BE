// Chuyển các phâầ tử trong mảng thành string
function transformArrayToString(arr) {
  const transformArr = arr.map((ele) => {
    const elem = ele.toString()
    return elem
  })
  return transformArr
}
export default transformArrayToString
export function searchByFields(objects, query) {
  const result = []
  // Chuyển query thành chữ thường để tìm kiếm không phân biệt chữ hoa chữ thường
  // const regex = new RegExp(query.toLowerCase())

  for (const obj of objects) {
    // Kiểm tra từng trường trong đối tượng
    for (const key of Object.keys(obj)) {
      // Nếu trường là name, author hoặc actor và giá trị của trường chứa query
      if (
        (key === 'movieName' || key === 'screenName' || key === 'cinemaName'|| key === 'status' ) &&
        obj[key].toLowerCase().includes(query.toLowerCase())
      ) {
        result.push(obj)
        break // Thoát khỏi vòng lặp nếu đã tìm thấy kết quả
      }
    }
  }

  return result
}
export function convertNumberToAlphabet(num) {
  const alphabetArray = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ]

  // Kiểm tra nếu num nằm trong khoảng từ 1 đến 26 (số lượng chữ cái trong bảng chữ cái)
  if (num >= 1 && num <= 26) {
    return alphabetArray[num - 1] // Trả về chữ cái tương ứng trong mảng
  } else {
    return num.toString() // Trả về số nếu không nằm trong khoảng từ 1 đến 26
  }
}
