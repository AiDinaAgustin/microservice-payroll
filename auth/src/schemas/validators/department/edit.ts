import { object, string } from 'yup';

export const DepartmentUpdateSchema = object().shape({
    body: object().shape({
        name: string().required(),
        status: string().oneOf(['active', 'inactive']).optional(),
    }),
});