import BaseError from '@responses/BaseError'
import * as fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import { jwtVerify } from 'jose';
import crypto from 'crypto';

const publicKey = fs.readFileSync('public.pem', 'utf-8');

const fetchToken = async (token: string) => {
   try {
      const cryptPublicKey = crypto.createPublicKey(publicKey);
      const decodedToken = await jwtVerify(token, cryptPublicKey);
      return decodedToken;
   } catch (error) {
      throw new BaseError({
         status: StatusCodes.UNAUTHORIZED,
         message: 'Failed fetch token',
      });
   }
}
export default fetchToken;
