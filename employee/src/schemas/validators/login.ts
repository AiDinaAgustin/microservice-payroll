import { object, string } from 'yup';

export const LoginSchema = object({
  body: object({
    username: string().required('Username is required'), 
    password: string().required('Password is required'), 
  }),
});
