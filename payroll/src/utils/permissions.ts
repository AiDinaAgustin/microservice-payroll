import Permission from '@models/Permission'
import RolePermission from '@models/RolePermission'

const permissions = async (role_id: string) => {
   const rolePermissions = await RolePermission.findAll({
      include: [
         {
            model: Permission
         }
      ],
      where: { role_id: role_id }
   })

   const permission = rolePermissions.map((permission) => {
      return permission.Permission
   })

   const mappingPermission = (data: any, parent_id: any = null) => {
      const tree: any = []

      data.map((perm: any) => {
         if (perm?.parent_id === parent_id) {
            const props : any = {
               id: perm?.id,
               name: perm?.name,
               code: perm?.code,
               parent_id: perm?.parent_id,
               type: perm?.type
            }
            if (perm?.type === 'menu') {
               props.submenus = mappingPermission(data, perm.id)
            }

            tree.push(props);
         }
      })
      return tree
   }

   const result = mappingPermission(permission)

   return result
}

export default permissions
