exports.logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "Lax" });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};
