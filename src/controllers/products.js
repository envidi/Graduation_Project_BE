// import Product from '../models/Product.js';
import Product from '../model/Product.js';
import productSchema from '../validations/product.js'
import Category from '../model/Category.js'

export const getAll = async (req, res) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = req.query;
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    };
    const data = await Product.paginate({}, options);
    if (!data || data.docs.length === 0) {
      throw new Error('No product found!');
    }
    return res.status(200).json({
      message: 'Success',
      datas: data
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Product.findById(id);
    if (!data) {
      throw new Error('Failed!');
    }
    return res.status(200).json({
      message: 'Success',
      datas: data
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const { error } = productSchema.validate(body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }
    const data = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!data) {
      throw new Error('Failed!');
    }
    return res.status(200).json({
      message: 'Success!',
      datas: data
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const create = async (req, res) => {
  try {
    const body = req.body;
    // const { error } = productSchema.validate(body, { abortEarly: true });
    // if (error) {
    //   return res.status(400).json({
    //     message: error.details[0].message
    //   });
    // }
    const data = await Product.create(body);
    // Tạo ra mảng array của category
    const arrayCategory = data.categoryId
    // Tạo vòng lặp để thêm từng cái product id vào mỗi mảng product của category
    for (let i = 0; i < arrayCategory.length; i++) {
      await Category.findOneAndUpdate(arrayCategory[i], {
        $addToSet :{
          products : data._id
        }
      })

    }


    if (!data) {
      throw new Error('Failed!');
    }
    return res.status(200).json({
      message: 'Success',
      datas: data
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Product.findOneAndDelete({ _id : id });
    // if (!data) {
    //   throw new Error('Failed!');
    // }
    return res.status(200).json({
      message: 'Success!',
      data
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
