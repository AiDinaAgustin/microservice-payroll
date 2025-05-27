import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

const imageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const allowedMimetypes = [
      "image/jpeg", // .jpg or .jpeg
      "image/png", // .png
      "image/gif", // .gif
      "image/webp", // .webp
    ]
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true); 
    } else {
      cb(new Error("Please upload only image files.")); 
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../../resources/static/assets/uploads/");
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-template-${file.originalname}`);
    },
});

const uploadImageFile = multer({ storage, fileFilter: imageFilter });

export default uploadImageFile;