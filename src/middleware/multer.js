import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Thư mục lưu trữ ảnh trên máy chủ
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Đặt tên file để không trùng lặp
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  // Kiểm tra nếu mimetype của file nằm trong danh sách được chấp nhận
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP file types are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Giới hạn file tối đa 5MB
  }
});