/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'

export const getAllService = async (reqBody) => {
    try {
        const {
            _page = 1,
            _limit = 10,
            _sort = 'createdAt',
            _order = 'asc',
            includeDeleted // Thêm tham số này để kiểm tra query parameter
        } = reqBody.query; // Sử dụng req.query thay vì req.body để nhận tham số từ query string

        const queryCondition = includeDeleted === 'true' ? {} : { isDeleted: false }

        const options = {
            page: _page,
            limit: _limit,
            sort: {
                [_sort]: _order === 'asc' ? 1 : -1
            }
        }
        // const data = await Ticket.paginate({}, options)
        // const data = await Ticket.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
        const data = await Ticket.paginate(queryCondition, options);

        if (!data || data.docs.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'No Ticket found!')
        }
        return data
    } catch (error) {
        throw error
    }
}

export const getOneService = async (reqBody) => {
    try {
        const id = reqBody.params.id
        // const data = await Ticket.findById(id)
        // const data = await Ticket.findOne({ _id: id, isDeleted: false }); // Kiểm tra thêm điều kiện không bị xóa mềm
        const { includeDeleted } = reqBody.query // lấy tham số includeDeleted từ query string
        const queryCondition = includeDeleted === 'true' ? { _id: id } : { _id: id, isDeleted: false };
        const data = await Ticket.findOne(queryCondition)
        if (!data || data.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Not Ticket found!')
        }
        return data
    } catch (error) {
        throw error
    }
}