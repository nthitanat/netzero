function serializeUser(user) {
  return {
    id: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImage: user.profileImage,
    phoneNumber: user.phoneNumber,
    address: user.address,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

module.exports = { serializeUser };
