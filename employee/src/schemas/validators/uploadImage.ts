import BaseError from '@responses/BaseError';
import { NextFunction, Request, Response } from 'express';

const MAX_IMAGE_SIZE = 2000000;
const uploadImage = (req: Request, res: Response, next: NextFunction) => {
   // @ts-ignore
   const image = req.files?.image;
   if (image && !Array.isArray(image)) {
      if (image.size > MAX_IMAGE_SIZE) {
         throw new BaseError({
            status: 400,
            message: 'image size too large, max 2MB',
         });
      }

      const allowedMimeTypes = /jpg|png|jpeg/;
      const isAllowedMimeTypes = allowedMimeTypes.test(image.mimetype);

      if (!isAllowedMimeTypes) {
         throw new BaseError({
            status: 400,
            message: 'please upload a correct image, only (jpg, png, jpeg) allowed',
         });
      }
   }

   next();
};

export default uploadImage;
