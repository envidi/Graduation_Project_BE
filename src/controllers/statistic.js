import { StatusCodes } from 'http-status-codes'
import Ticket, { PAID } from '../model/Ticket'
import user from '../model/user'
const PERCENT_PROFIT_FOOD = 85 / 100
export const getProfit = async (req, res, next) => {
  try {
    const data = await Ticket.find({ status: PAID })
    if (!data || data.length == 0) {
      return []
    }
    const profitFood =
      data
        .map(
          (ticket) =>
            ticket.foods.length > 0 &&
            ticket.foods.reduce((acc, food) => {
              return acc + food.price * food.quantityFood
            }, 0)
        )
        ?.reduce(
          (acc, item) => acc + parseFloat(item) * PERCENT_PROFIT_FOOD,
          0
        ) || 0
    const revenueFood =
      data
        .map(
          (ticket) =>
            ticket.foods.length > 0 &&
            ticket.foods.reduce((acc, food) => {
              return acc + food.price * food.quantityFood
            }, 0)
        )
        ?.reduce((acc, item) => acc + parseFloat(item), 0) || 0
    const priceMovie = data.reduce(
      (acc, ticket) => acc + ticket.priceId.price,
      0
    )
    const revenue = data.reduce((acc, item) => acc + item.totalPrice, 0)

    const totalProfit = revenue - priceMovie - revenueFood + profitFood

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      totalProfit,
      revenue
    })
  } catch (error) {
    next(error)
  }
}
export const getTop5MovieRevenue = async (req, res, next) => {
  try {
    const data = await Ticket.aggregate([
      {
        $match: {
          status: PAID
        }
      },
      {
        $group: {
          _id: '$movieId',
          totalSold: { $sum: '$totalPrice' },
          priceMovie: {
            $sum: '$priceId.price'
          },
          priceFood: {
            $sum: '$totalFood'
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies', // collection chứa thông tin các bộ phim
          localField: '_id', // trường trong collection 'sales'
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                image: 1
              }
            }
          ],
          foreignField: '_id', // trường tương ứng trong collection 'movies'
          as: 'movieDetails' // tên mảng chứa kết quả sau khi kết nối
        }
      },
      {
        $project: {
          movieDetails: 1,
          totalSold: 1,
          priceMovie: 1,
          priceFood: 1,
          profit: {
            $add: [
              {
                $subtract: [
                  { $subtract: ['$totalSold', '$priceMovie'] }, // Trừ 'totalSold' - 'priceMovie'
                  '$priceFood' // Sau đó, trừ kết quả từ bước trước đi 'priceFood'
                ]
              },
              { $multiply: ['$priceFood', 0.85] }
            ]
          }
        }
      }
    ])
    if (!data || data.length == 0) {
      return []
    }

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const getSexUser = async (req, res, next) => {
  try {
    const data = await user.find({})

    if (!data || data.length == 0) {
      return []
    }
    const male =
      (data.filter((user) => user.sex == 'Nam').length / data.length) * 100
    const female =
      (data.filter((user) => user.sex == 'Nữ').length / data.length) * 100
    const theRest = 100 - male - female
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      sex: [Math.floor(male), Math.floor(female), Math.floor(theRest)]
    })
  } catch (error) {
    next(error)
  }
}
export const getAgeUser = async (req, res, next) => {
  try {
    const [all, boy, man, oldMan] = await Promise.all([
      user.find({}).select('age'),
      user.find({ age: { $gte: 10, $lt: 20 } }).select('age'),
      user.find({ age: { $gte: 20, $lt: 30 } }).select('age'),
      user.find({ age: { $gte: 30, $lt: 45 } }).select('age')
    ])
    if (!all || all.length == 0) {
      return []
    }
    const boyData = (boy.length / all.length) * 100
    const manData = (man.length / all.length) * 100

    const oldManData = (oldMan.length / all.length) * 100
    const theRest =
      100 -
      (parseFloat(boyData.toFixed(1)) +
        parseFloat(manData.toFixed(1)) +
        parseFloat(oldManData.toFixed(1)))

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      age: [
        parseFloat(boyData.toFixed(1)),
        parseFloat(manData.toFixed(1)),
        parseFloat(oldManData.toFixed(1)),
        parseFloat(theRest.toFixed(1))
      ]
    })
  } catch (error) {
    next(error)
  }
}
export const getRevenueAfterWeek = async (req, res, next) => {
  try {
    const data = await Ticket.aggregate([
      {
        $match: {
          createdAt: {
            $lt: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          dailyRevenue: { $sum: '$totalPrice' },
          totalFood: { $sum: '$totalFood' },
          totalPriceMovie: { $sum: '$priceId.price' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          _id: 1,
          dailyRevenue: 1,
          totalFood: 1,
          totalPriceMovie: 1,
          profit: {
            $subtract: [
              {
                $add: [
                  { $subtract: ['$dailyRevenue', '$totalPriceMovie'] },
                  { $multiply: ['$totalFood', 0.85] }
                ]
              },
              '$totalFood'
            ]
          }
        }
      }
    ])
    const revenue = data.map((ticket) => ticket.dailyRevenue)
    const profit = data.map((ticket) => ticket.profit)
    const date = data.map((ticket) => {
      const day = ticket._id.day < 10 ? '0' + ticket._id.day : ticket._id.day
      const month =
        ticket._id.month < 10 ? '0' + ticket._id.month : ticket._id.month
      return `${day}.${month}.${ticket._id.year}`
    })

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      series: [
        {
          name: 'Doanh thu',
          data: revenue
        },
        {
          name: 'Lợi nhuận',
          data: profit
        }
      ],
      date
    })
  } catch (error) {
    next(error)
  }
}
