import User from '@models/User'

const findById = async (id: string) => {
   return User.findOne({
      where: {
         id: id,
         deleted: 0,
      }
   });
}

const findByUsername = async (username: string) => {
   return User.findOne({
      where: {
         username: username,
         deleted: 0,
      },
   });
}

export default {
   findById,
   findByUsername,
}
