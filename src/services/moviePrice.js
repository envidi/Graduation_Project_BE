import MoviePrice from '../model/MoviePrice'

export const moviePriceService = {
  remove: async (id) => {
    const moviePrice = await MoviePrice.findByIdAndDelete(id)
    return moviePrice
  }
}
