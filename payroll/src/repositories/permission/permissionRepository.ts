import RolePermission from '@models/RolePermission';
import Permission from '@models/Permission';

const findByRoleIdAndEndpoint = async (roleId: string, endpoint: string) => {
  try {
    return await RolePermission.findOne({
      where: {
        role_id: roleId,
        deleted: 0,
      },
      include: [{
        model: Permission,
        where: { endpoint: endpoint, deleted: 0 }
      }]
    });
  } catch (error) {
    console.error('Error finding role permission by role ID and endpoint:', error);
    throw error;
  }
};

const findMenuPermission = async (roleId: string) => {
  try {
    return await RolePermission.findOne({
      where: {
        role_id: roleId,
        deleted: 0,
      },
      include: [{
        model: Permission,
        where: { type: 'menu', deleted: 0 }
      }]
    });
  } catch (error) {
    console.error('Error finding menu permission by role ID:', error);
    throw error;
  }
};

export default {
  findByRoleIdAndEndpoint,
  findMenuPermission
};