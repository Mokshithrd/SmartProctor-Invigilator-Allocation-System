exports.logout = (req, res) => {
    try{
        res.clearCookie("token", { httpOnly: true, sameSite: "Lax" });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch(error) {
        res.status(500).json({success: false, message: "Failed to log out"});
    }
};
