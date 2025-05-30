import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

const excelFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload only excel file."));
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../resources/static/assets/uploads/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-template-${file.originalname}`);
  },
});

const uploadFile = multer({ storage, fileFilter: excelFilter });

export default uploadFile;