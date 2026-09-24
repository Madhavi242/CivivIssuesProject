const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { emitToUser, emitToRole, emitToDepartment, emitBroadcast } = require('../config/socket');

const logAudit = async ({
  userId = null,
  action,
  targetType,
  targetId = null,
  details = {},
  req = null,
}) => {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    await AuditLog.create({
      user: userId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('⚠️ [AuditLog Error]:', error.message);
  }
};

const sendNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedIssueId = null,
  deptId = null,
  role = null,
}) => {
  try {
    // If specific user recipient
    let notification = null;
    if (recipientId) {
      notification = await Notification.create({
        recipient: recipientId,
        type,
        title,
        message,
        relatedIssue: relatedIssueId,
      });

      emitToUser(recipientId.toString(), 'notification', notification);
    }

    // Role-based or department broadcast
    if (role) {
      emitToRole(role, 'notification', { type, title, message, relatedIssue: relatedIssueId });
    }
    if (deptId) {
      emitToDepartment(deptId.toString(), 'notification', { type, title, message, relatedIssue: relatedIssueId });
    }

    emitBroadcast('system_alert', { type, title, message });

    return notification;
  } catch (error) {
    console.error('⚠️ [Notification Error]:', error.message);
    return null;
  }
};

module.exports = {
  logAudit,
  sendNotification,
};
