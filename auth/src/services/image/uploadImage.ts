import axios from "axios";
import dotenv from 'dotenv'
import errorThrower from '@utils/errorThrower'
import fs from "fs";

dotenv.config()

const ownCloudUrl = process.env.OWN_CLOUD_BASE_URL || ''
const username = process.env.OWN_CLOUD_USERNAME || ''
const password = process.env.OWN_CLOUD_PASSWORD || ''
const folderName = process.env.OWN_CLOUD_FOLDER_NAME || ''

export const uploadImageEmployee = async (filePath: string, fileName: string) => {
    try {
        const fileBuffer = fs.createReadStream(filePath);

        const response = await axios.put(`${ownCloudUrl}/webdav/${folderName}/${fileName}`, fileBuffer, {
            auth: {
                username,
                password,
            },
            headers: {
            "Content-Type": "application/octet-stream",
            Overwrite: "T",
            },
        });

        if (response.status === 201 || response.status === 204) {
            return {
            path: fileName
            };
        } else {
            throw errorThrower("Failed to upload file to OwnCloud");
        }
    } catch (err: any) {
        throw errorThrower(err.message)
    } finally {
        // Menghapus file sementara setelah upload
        fs.unlinkSync(filePath);
    }
}
