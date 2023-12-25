// Chuyển các phâầ tử trong mảng thành string
function transformArrayToString(arr) {
  const transformArr = arr.map((ele) => {
    const elem = ele.toString()
    return elem
  })
  return transformArr
}
export default transformArrayToString
