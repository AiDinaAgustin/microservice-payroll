import { uploadImageEmployee } from '@services/image/uploadImage'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BaseReponse } from '@responses/BaseResponse'
import path from "path";
import fs from "fs"; 

export const EmployeeUploadImageController = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const file = req.file

       if (!req.file) {
        return res.status(400).send("Please upload an Excel file!");
       }

       const filePath = path.join(__dirname, "../../../../resources/static/assets/uploads/", req.file.filename)

       const data = await uploadImageEmployee(filePath, req.file.originalname)

       const imagePath = `${req.protocol}://${req.get("host")}/v1/image/${data.path}`
 
       res.status(StatusCodes.OK).json(
          new BaseReponse({
             status: StatusCodes.OK,
             message: 'Uploaded successfully',
             data: {
                imagePath: imagePath
             }
          })
       )
    } catch (err: any) {
       next(err)
    }
 }
 