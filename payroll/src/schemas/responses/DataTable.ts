class DataTable<T> {
   content: T[] = []
   currentPage: number = 1
   hasPreviousPage: boolean = false
   hasNextPage: boolean = false

   constructor(data: T[], totalRows: number, currentPage: number, limit: number) {
      this.content = data;
      this.currentPage = currentPage;
      this.hasNextPage = data.length === limit;
      this.hasPreviousPage = this.currentPage > 1;
   }
   }


export default DataTable
