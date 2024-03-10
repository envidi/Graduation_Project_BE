import Movie from '../model/Movie.js'
import Category from '../model/Category.js'
import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/stringToSlug.js'
import categorySchema from '../validations/category.js'
import { StatusCodes } from 'http-status-codes'
import findDifferentElements from '../utils/findDifferent.js' //tìm thg mới, ko mới

// const handleErrorResponse = (res, error) => {
//   return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//     message: error.message
//   })
// }

export const getAll = async (req, res, next) => {
  try {
    // const categoryId = req.params.id;
    const { id: categoryId } = req.params
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = req.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    const data = await Category.paginate({ categoryId }, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No categories found!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data.docs
    })
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    // const categoryId = req.query.id;
    const { id: categoryId } = req.query
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      _embed
    } = req.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    const populateOptions = _embed ? { path: 'products', select: 'name' } : []
    const data = await Category.findOne({ _id: categoryId })
    if (!data || data.length === 0)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not category found!')
    const result = await Category.paginate(
      { _id: categoryId },
      { ...options, populate: populateOptions }
    )
    if (!result && result.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not category found!')
    }
    if (_embed) {
      return res.status(StatusCodes.OK).json({
        data: {
          categoryId,
          products: result.docs
        }
      })
    } else {
      return res.status(StatusCodes.OK).json({
        data: result.docs
      })
    }
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const id = req.params.id
    const body = req.body

    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id category not found')
    }
    const { error } = categorySchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Category.findById(id, 'products')

    const result = findDifferentElements(data.products, body.products)

    const newProduct = result.filter((pro) => {
      if (body.products.includes(pro)) {
        return pro
      }
    })


    // Những id category bị xóa khỏi mảng categoryId của movie
    const deletedProductfromCategory = findDifferentElements(
      newProduct,
      result
    )
    const updateData = await Category.updateOne({ _id: id }, body)
    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update category failed!')
    }
    if (newProduct && newProduct.length > 0) {
      await Movie.updateMany(
        {
          _id: {
            // tìm ra tất cả những id trong mảng dùng $in
            $in: newProduct
          }
        },
        {
          // Thêm productId vào products trong category nếu có rồi thì ko thêm , chưa có thì mới thêm dùng $addToSet
          $addToSet: {
            categoryId: id
          }
        }
      )
    }
    if (deletedProductfromCategory && deletedProductfromCategory.length > 0) {
      await Movie.updateMany(
        {
          _id: {
            // tìm ra tất cả những id trong mảng dùng $in
            $in: deletedProductfromCategory
          }
        },
        {
          // Xóa productId khỏi products trong category thì dùng $pull
          $pull: {
            categoryId: id
          }
        }
      )
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data: updateData
    })
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const body = req.body
    const { error } = categorySchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Category.create({
      ...body,
      slug: slugify(body.name)
    })
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create category failed')
    }
    // Tạo ra mảng array của product
    const arrayProduct = data.products
    // Tạo vòng lặp để thêm product với category
    for (let i = 0; i < arrayProduct.length; i++) {
      await Movie.findOneAndUpdate(arrayProduct[i], {
        $addToSet: {
          categoryId: data._id
        }
      })
    }
    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await Category.findByIdAndDelete(id)
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete category failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}


