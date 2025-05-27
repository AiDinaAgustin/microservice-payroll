import readXlsxFile from "read-excel-file/node";
import { v4 as uuidv4 } from "uuid";
import Employee from "@models/Employee";
import Contract from "@models/Contract";
import Position from "@models/Position";
import Department from "@models/Department";
import MaritalStatus from "@models/MaritalStatus";
import ContractType from "@models/ContractType";
import { parse, format } from "date-fns";
import fs from "fs";
import path from "path";
import * as yup from "yup";
import ExcelJS from "exceljs";
import { Op } from "sequelize";

const employeeSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  nik: yup.string().matches(/^\d{16}$/, 'NIK must be exactly 16 digits'), 
  employee_id: yup.string().required("Employee ID is required"),
  email: yup.string().required("Email is required").email("Invalid email format"),
  phone_number: yup
    .string()
    .required("Phone number is required")
    .matches(/^08|^\+62/, "Phone number must start with 08 or +62"),
  address: yup.string().required("Address is required"),
  birth_date: yup.date().required("Date of Birth is required"),
  gender: yup.string().required("Gender is required"),
  marital_status: yup.string().required("Marital status is required"),
  positionName: yup.string().required("Position is required"),
  departmentName: yup.string().required("Department is required"),
  contract_type: yup.string().required("Contract type is required"),
  start_date: yup.date().required("Start date is required"),
  end_date: yup.date().nullable(),
  npwp: yup
    .string()
    .nullable()
    .transform((value) => (value === "" || value === "null" ? null : value))
    .length(16, "NPWP must be 16 characters")
    .notRequired(),
  emergency_contact: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .matches(/^08|^\+62/, "Emergency contact must start with 08 or +62")
    .notRequired(),
});

const allowedMaritalStatuses = ["Single", "Married", "Widowed", "Separated", "Divorced"];

export const processExcelFile = async (filePath: string, tenantId: string) => {
  const rows = await readXlsxFile(filePath);
  rows.shift(); 
  rows.shift(); 

  const results: any[] = [];
  let totalRowsError = 0;

  for (const row of rows) {
    console.log(row[6]);
    try {
      const employeeData = {
        name: row[0] as string,
        nik: String(row[1]),
        employee_id: String(row[2]),
        email: String(row[3]),
        status: "active",
        phone_number: row[4] as string,
        address: row[5] as string,
        birth_date: row[6],
        gender: row[7] as string,
        marital_status: row[8] as string,
        medical_condition: row[9] ? (row[9] as unknown as Text) : undefined,
        npwp: String(row[10]),
        emergency_contact: row[11] as string,
        positionName: row[12] as string,
        departmentName: row[13] as string,
        contract_type: row[18] as string,
        start_date: row[19] ,
        end_date: row[20],
      };

      const errors: string[] = [];

      try {
        await employeeSchema.validate(employeeData, { abortEarly: false });
      } catch (validationError) {
        if (validationError instanceof yup.ValidationError) {
          errors.push(...validationError.errors);
        }
      }

      const maritalStatus = await MaritalStatus.findOne({
        where: {
          status: { [Op.iLike]: employeeData.marital_status },
        }
      })

      if (!maritalStatus) {
        errors.push(`Marital status not found, Allowed statuses are : ${allowedMaritalStatuses.join(", ")}`);
      }

      let department = await Department.findOne({
        where: {
          name: { [Op.iLike]: employeeData.departmentName },
          tenant_id: tenantId,
        }
      });

      if (!department) {
        department = await Department.create({
          id: uuidv4(),
          name: employeeData.departmentName,
          tenant_id: tenantId,
          created_at: new Date(),
          updated_at: new Date(),
        })
      }

      let position = await Position.findOne({ 
        where: {
          name: { [Op.iLike]: employeeData.positionName },
          tenant_id: tenantId,
          department_id: department.id,
        }
      })

      if (!position) {
        position = await Position.create({
          id: uuidv4(),
          name: employeeData.positionName,
          tenant_id: tenantId,
          department_id: department.id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }


      let contractType = await ContractType.findOne({
        where: {
          name: { [Op.iLike]: employeeData.contract_type },
          tenant_id: tenantId,
        }
      })

      if (!contractType) {
        contractType = await ContractType.create({
          id: uuidv4(),
          name: employeeData.contract_type,
          tenant_id: tenantId,
          is_permanent: false,
        })
      }

      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }
      const manager = row[14] ? await Employee.findOne({ where: { employee_id: String(row[14]) } }) : undefined;
      const supervisor = row[15] ? await Employee.findOne({ where: { employee_id: String(row[15]) } }) : undefined;
      const teamLead = row[16] ? await Employee.findOne({ where: { employee_id: String(row[16]) } }) : undefined;
      const mentor = row[17] ? await Employee.findOne({ where: { employee_id: String(row[17]) } }) : undefined;

      const[employee, created] = await Employee.upsert({
        ...employeeData,
        medical_condition: employeeData.medical_condition,
        birth_date: employeeData.birth_date
                    ? new Date(employeeData.birth_date as string)
                    : undefined,
        marital_status_id: maritalStatus!.id,
        position_id: position!.id,
        department_id: department!.id,
        manager_id: manager ? manager.id : undefined,
        supervisor_id: supervisor ? supervisor.id : undefined,
        team_lead_id: teamLead ? teamLead.id : undefined,
        mentor_id: mentor ? mentor.id : undefined,
        tenant_id: tenantId,
      }, { returning: true });

      const contractData = {
        employee_id: employee.id,
        contract_type_id: contractType!.id,
        start_date: employeeData.start_date
    ? new Date(employeeData.start_date as string) // Konversi jika berbentuk string
    : undefined, // Pastikan tidak ada nilai null
  end_date: employeeData.end_date
    ? new Date(employeeData.end_date as string) // Sama seperti di atas
    : null, // Sesuai dengan definisi model
      };


      const existingContract = await Contract.findOne({
        where: {
          employee_id: contractData.employee_id,
        },
      });

      if (existingContract) {
        await existingContract.update(contractData);
      } else {
        await Contract.create(contractData);
      }

      results.push({
        id: employee.id,
        name: employee.name,
        nik: employee.nik,
        employee_id: employee.employee_id,
        status: "success",
      });
    } catch (error) {
      totalRowsError++;
      results.push({
        id: uuidv4(),
        name: row[0],
        nik: row[1],
        employee_id: row[2],
        status: (error as Error).message,
      });
    }
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('File deleted successfully');
    }
  });

  return { totalRowsError, results };
};

export const generateExcelFile = async (data: any[]): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Employees");

  worksheet.mergeCells("A1:L1");
  worksheet.mergeCells("M1:N1");
  worksheet.mergeCells("O1:R1");
  worksheet.mergeCells("S1:U1");

  worksheet.getCell("E1").value = "PERSONAL";
  worksheet.getCell("M1").value = "JOB DETAILS";
  worksheet.getCell("P1").value = "REPORTING STRUCTURE";
  worksheet.getCell("T1").value = "CONTRACT INFORMATION";

  worksheet.getRow(2).values = [
    "Name",
    "NIK",
    "Employee ID",
    "Email",
    "Phone Number",
    "Address",
    "Date of Birth",
    "Gender",
    "Marital Status",
    "Medical Condition",
    "NPWP",
    "Emergency Contact",
    "Position",
    "Department",
    "Manager",
    "Supervisor",
    "Team Leads",
    "Mentor",
    "Contract Type",
    "Start Date",
    "End Date",
  ];

  // Styling opsional agar lebih rapi
  worksheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).alignment = { horizontal: "left", vertical: "middle" };

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(2).font = { bold: true };

  worksheet.columns = [
    { key: "name", width: 25 },
    { key: "nik", width: 20 },
    { key: "employee_id", width: 15 },
    { key: "email", width: 25 },
    { key: "phone_number", width: 15 },
    { key: "address", width: 25 },
    { key: "birth_date", width: 15 },
    { key: "gender", width: 10 },
    { key: "marital_status_id", width: 15 },
    { key: "medical_condition", width: 25 },
    { key: "npwp", width: 20 },
    { key: "emergency_contact", width: 25 },
    { key: "position_id", width: 15 },
    { key: "department_id", width: 15 },
    { key: "manager_id", width: 15 },
    { key: "supervisor_id", width: 15 },
    { key: "team_lead_id", width: 15 },
    { key: "mentor_id", width: 15 },
    { key: "contract_type_id", width: 15 },
    { key: "start_date", width: 15 },
    { key: "end_date", width: 15 },
  ];

  // Tambahkan data
  worksheet.addRows(data);

  return workbook;
};
