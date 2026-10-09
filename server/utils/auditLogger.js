import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({ req, action, entityType, entityId, description, details }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    await AuditLog.create({
      user: req?.user?._id,
      userName: req?.user?.name || 'System / Public',
      userRole: req?.user?.role || 'PUBLIC',
      action,
      entityType,
      entityId,
      description,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error(`[ORHIMS Audit Log Error]: ${error.message}`);
  }
};
