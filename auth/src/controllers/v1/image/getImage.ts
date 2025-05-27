import { NextFunction, Request, Response } from 'express'
import { getImageFromOwnCloud } from '@services/image/getImage'

export const getImageController = async (req: Request, res: Response, next: NextFunction) => {
   const imageName = req.params.imageName // Nama file dari parameter URL
   // const filePath = `remote.php/dav/files/your-username/${imageName}`

   try {
      const imageBuffer = await getImageFromOwnCloud(imageName)

      // Set header untuk file gambar
      res.set('Content-Type', 'image/jpeg') // Sesuaikan MIME type (jpeg, png, dll.)
      res.set('Cross-Origin-Resource-Policy', 'cross-origin')
      res.send(imageBuffer)
   } catch (err: any) {
      next(err)
   }
}
