import MoviePrice from '../model/MoviePrice'

export const moviePriceService = {
  findById: async (id) => {
    try {
      const moviePrice = await MoviePrice.findById(id);
      return moviePrice;
    } catch (error) {
      throw new Error('Lỗi khi tìm giá phim theo ID');
    }
  },
  remove: async (id) => {
    try {
      const deletedMoviePrice = await MoviePrice.findByIdAndDelete(id);
      return deletedMoviePrice;
    } catch (error) {
      throw new Error('Lỗi khi xóa giá phim');
    }
  }
}
