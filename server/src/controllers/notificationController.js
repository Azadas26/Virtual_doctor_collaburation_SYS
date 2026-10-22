const Notification = require('../models/Notification');

// @desc Get Notifications for logged-in user
// @route GET /api/notifications
// @access Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

        return res.json({
            success: true,
            unreadCount,
            notifications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching notifications: ' + error.message
        });
    }
};

// @desc Mark Notification as Read
// @route PUT /api/notifications/:id/read
// @access Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }

        if (String(notification.userId) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        notification.isRead = true;
        await notification.save();

        return res.json({ success: true, notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating notification.' });
    }
};
