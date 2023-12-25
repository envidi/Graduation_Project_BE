// Tìm những phần từ chung trong mảng
import transformArrayToString from './ToStringArray.js'

function findCommonElements(arr1, arr2) {
  const transformArr = transformArrayToString(arr2)

  const transformArr2 = transformArrayToString(arr1)

  return transformArr2.filter((element) => {
    const ele = element.toString()
    return transformArr.includes(ele)
  })
}
export default findCommonElements