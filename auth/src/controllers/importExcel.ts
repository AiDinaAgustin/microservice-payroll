import { Request, Response } from "express";
import path from "path";
import { processExcelFile, generateExcelFile } from "@services/import/importExcelService";
import { StatusCodes } from 'http-status-codes';

export const upload = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send("Please upload an Excel file!");
    }

    const tenantIdHeader = req.headers['tenant-id'] as string;

    if (!tenantIdHeader) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'Tenant ID is required in the request header'
      });
    }

    const filePath = path.join(__dirname, "../../resources/static/assets/uploads/", req.file.filename);
    const { totalRowsError, results } = await processExcelFile(filePath, tenantIdHeader);

    res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "OK",
      data: {
        totalRowsError,
        content: results,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Could not upload the file: " + req.file?.originalname,
    });
  }
};

export const download = async (req: Request, res: Response): Promise<void> => {
  try {
    // Data dummy
    const data = [
      {
        id: "1",
        employee_id: "EMP001",
        name: "John Doe",
        status: "active",
        nik: "1234567890123456",
        email: "john.doe@inovasi.id",
        phone_number: "081234567890",
        address: "Bandung",
        birth_date: new Date(1/1/1990),
        gender: "Male",
        marital_status_id: "Single",
        npwp: "1234567890123456",
        emergency_contact: "081234567891",
        position_id: "HR Manager",
        department_id: "HR",
        manager_id: "EMP002",
        supervisor_id: "EMP003",
        team_lead_id: "EMP004",
        mentor_id: "EMP005",
        medical_condition: "Lambung",
        contract_type_id: "Part-Time",
        start_date: new Date(8/8/2021),
        end_date: new Date(8/8/2022),
      },
      {
        id: "2",
        employee_id: "EMP002",
        name: "John Doe",
        status: "active",
        nik: "1234567890123456",
        email: "john.doe@inovasi.id",
        phone_number: "081234567890",
        address: "Bandung",
        birth_date: new Date(1/1/1990),
        gender: "Male",
        marital_status_id: "Single",
        npwp: "1234567890123456",
        emergency_contact: "081234567891",
        position_id: "HR Manager",
        department_id: "HR",
        manager_id: "EMP002",
        supervisor_id: "EMP003",
        team_lead_id: "EMP004",
        mentor_id: "EMP005",
        medical_condition: "Lambung",
        contract_type_id: "Part-Time",
        start_date: new Date(8/8/2021),
        end_date: new Date(8/8/2022),
      },
    ];

    const workbook = await generateExcelFile(data);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "Template-Import-Employee-HR-Payroll-360.xlsx"
    );

    await workbook.xlsx.write(res);
    res.status(StatusCodes.OK).end();
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: (err as Error).message || "Could not download the file.",
    });
  }
};