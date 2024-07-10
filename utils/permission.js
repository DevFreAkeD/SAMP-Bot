module.exports = {
    hasAdminPermission(member) {
        return member.permissions.has('ADMINISTRATOR');
    }
};
