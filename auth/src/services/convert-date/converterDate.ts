import { MonthRange } from '@interfaces/employee/dateInterface'

export function ConvertFormatDate(dateString: string): Date {
   const regex = /^\d{2}-\d{2}-\d{4}$/

   const defaultDate = new Date(`00-00-00`)
   if (regex.test(dateString)) {
      const [day, month, year] = dateString.split('-')
      const formattedDate = new Date(`${year}-${month}-${day}`)

      if (formattedDate.getDate() === parseInt(day)) {
         return formattedDate
      }
   }
   return defaultDate
}

export function ConvertFormatDateNulllable(dateString: string | undefined): Date | null {
   const regex = /^\d{2}-\d{2}-\d{4}$/

   if (dateString !== undefined) {
      if (regex.test(dateString)) {
         const [day, month, year] = dateString.split('-')
         const formattedDate = new Date(`${year}-${month}-${day}`)

         if (formattedDate.getDate() === parseInt(day)) {
            return formattedDate
         }
      }
   }
   return null
}

// Method untuk mendapatkan tanggal tanpa waktu YYYY-MM-DD
export const formatDate = (date: Date): string => {
   const year = date.getFullYear()
   const month = String(date.getMonth() + 1).padStart(2, '0')
   const day = String(date.getDate()).padStart(2, '0')
   return `${year}-${month}-${day}`
}

export const ConvertDateToYYYMMDD = (dateString: string): string => {
   const [day, month, year] = dateString.split('-')
   return `${year}-${month}-${day}`
}

// Method untuk mendapatkan range tanggal dari string dd-MM-yyyy
export const getMonthRangeFromDate = (dateString: string): MonthRange => {
   const [day, month, year] = dateString.split('-')
   let startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
   let endDate = new Date(startDate)
   endDate.setDate(startDate.getDate() + 30)

   return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
   }
}

// Method untuk mendapatkan range tanggal yang diawali hari ini
export const getCurrentMonthRange = (): MonthRange => {
   const today = new Date()
   let startDate = today
   let endDate = new Date(today)
   endDate.setDate(today.getDate() + 30)

   return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
   }
}

// Method untuk mendapatkan bulan awal dan akhir tiap kuartal, example input Q1-2024
export const getQuarterDateRange = (quarter: string): { startDate: string; endDate: string } => {
   const quarterMonths: Record<string, [number, number]> = {
      Q1: [1, 3], // Januari - Maret
      Q2: [4, 6], // April - Juni
      Q3: [7, 9], // Juli - September
      Q4: [10, 12] // Oktober - Desember
   }
   const [q, yearStr] = quarter.split('-')
   const year = parseInt(yearStr, 10)

   const [startMonth, endMonth] = quarterMonths[q]
   const startDate = new Date(year, startMonth - 1, 1)
   const endDate = new Date(year, endMonth, 0)

   return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
   }
}

// Method untuk mendapatkan range date berdasarkan bulan & tahun example input: 01-2024
export const getDateRangeByMonth = (input: string): { startDate: string; endDate: string } => {
   const [month, year] = input.split('-')
   const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
   const endDate = new Date(parseInt(year), parseInt(month), 0)

   return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
   }
}