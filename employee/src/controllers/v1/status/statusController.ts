import { Request, Response } from 'express';
import DataTable from '@responses/DataTable';

export const getStatuses = (req: Request, res: Response) => {
    const statuses = [
        { id: 1, name: 'active' },
        { id: 2, name: 'on leave' }
    ];

    const currentPage = 1;
    const limit = statuses.length;
    const dataTable = new DataTable(statuses, statuses.length, currentPage, limit);

    const response = {
        status: 200,
        message: "Statuses found",
        data: dataTable
    };

    res.status(200).json(response);
};