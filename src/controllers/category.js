// import Product from '../models/Product.js';
import Category from '../model/Category.js';
import categorySchema from '../validations/category.js';

const handleErrorResponse = (res, error) => {
  return res.status(500).json({
    message: error.message
  });
};

export const getAll = async (req, res) => {
  try {
    // const categoryId = req.params.id;
    const { id: categoryId } = req.params;
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
    const data = await Category.paginate({ categoryId }, options);
    if (!data || data.docs.length === 0) throw new Error('Failed!');
    return res.status(200).json({
      message: 'Success',
      data: data.docs
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getDetail = async (req, res) => {
  try {
    // const categoryId = req.query.id;
    const { id: categoryId } = req.query
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      _embed
    } = req.query;
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    };
    const populateOptions = _embed ? { path: 'products', select: 'name' } : [];
    const data = await Category.findOne({ _id: categoryId })
    if (!data || data.length === 0) throw new Error('No category found!');
    const result = await Category.paginate(
      { _id: categoryId },
      { ...options, populate: populateOptions }
    );
    if (!result && result.docs.length === 0) {
      return res.status(404).json({
        message: 'Not found category'
      });
    }
    if (_embed) {
      return res.status(200).json({
        data: {
          categoryId,
          products: result.docs
        }
      });
    } else {
      return res.status(200).json({
        data: result.docs
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const { error } = categorySchema.validate(body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }
    const data = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!data) throw new Error('Update category failed!');
    return res.status(200).json({
      message: 'Success!',
      data: data
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const create = async (req, res) => {
  try {
    const body = req.body;
    const { error } = categorySchema.validate(body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }
    const data = await Category.create(body);
    if (!data) throw new Error('Failed!');
    return res.status(201).json({
      message: 'Success',
      data: data
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Category.findByIdAndDelete(id);
    if (!data) {
      throw new Error('Failed!');
    }
    return res.status(200).json({
      message: 'Success!',
      data
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};
