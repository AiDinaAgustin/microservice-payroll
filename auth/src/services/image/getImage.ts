import axios from 'axios'
import dotenv from 'dotenv'
import errorThrower from '@utils/errorThrower'

dotenv.config()

const ownCloudUrl = process.env.OWN_CLOUD_BASE_URL || ''
const username = process.env.OWN_CLOUD_USERNAME || ''
const password = process.env.OWN_CLOUD_PASSWORD || ''
const folderName = process.env.OWN_CLOUD_FOLDER_NAME || ''

export const getImageFromOwnCloud = async (filePath: string): Promise<Buffer> => {
   try {
      const response = await axios.get(`${ownCloudUrl}/dav/files/${username}/${folderName}/${filePath}`, {
         auth: {
            username: username,
            password: password
         },
         responseType: 'arraybuffer' // Agar menerima data dalam bentuk buffer
      })
      return Buffer.from(response.data)
   } catch (err: any) {
      throw errorThrower(err.message)
   }
}
