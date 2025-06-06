import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {  // cb = callback
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

export default upload;