import { MaritalStatusOptionParams } from '@interfaces/marital-status/maritalStatusOptionParams'
import MaritalStatus from '@models/MaritalStatus'
import errorThrower from '@utils/errorThrower'
import { Op } from 'sequelize'

const findAllMaritalStatusOption = async ({ limit, keyword }: MaritalStatusOptionParams) => {
   try {
      let whereClause: any = { deleted: 0 }

      if (keyword) whereClause[Op.or] = { status: { [Op.iLike]: `%${keyword}%` } }

      const { rows: results } = await MaritalStatus.findAndCountAll({
         where: whereClause,
         limit,
         attributes: ['id', 'status'],
         order: [['status', 'ASC']]
      })

      const data = results.map(({ id, status }: any) => ({ id, name: status }))

      return { data }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default { findAllMaritalStatusOption }
