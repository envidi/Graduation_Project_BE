import findCommonElements from './findCommon.js'
import transformArrayToString from './ToStringArray.js'
// Tìm những phần tử khác nhau trong 2 mảng
function findDifferentElements(arr1, arr2) {
  const uniqueElements = new Set([...arr1, ...arr2])
  const transformArr = transformArrayToString(Array.from(uniqueElements))

  const commonElements = findCommonElements(arr1, arr2)
  const result = Array.from(transformArr).filter((element) => {

    return !commonElements.includes(element)
  })
  return result
}
export default findDifferentElements
