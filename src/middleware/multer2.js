import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'dbu06uco1',
  api_key: '792317861538592',
  api_secret: '3yTHT9k40QIoFUR1yZrT9uIxTKk'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Tạo public_id tùy chỉnh, ví dụ: sử dụng tên file gốc (bỏ đuôi file) và thêm timestamp
    const public_id = `food_Image/${Date.now()}-${file.originalname.split('.')[0]}`;
    console.log('Generated public_id:', public_id); // kiểm tra giá trị public_id
    return {
      folder: 'food_Image', // Thư mục lưu file trên Cloudinary
      allowedFormats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: public_id
    };
  }
});


export const upload2 = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Giới hạn file tối đa 5MB
  }
});

