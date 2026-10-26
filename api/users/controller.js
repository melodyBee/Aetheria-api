const User = require("./schema");
const { hash, compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");

const isAdmin = (user) => String(user?.Role).toLowerCase() === "admin";

const serverError = (res, error) =>
res.status(500).json({ message: "Server Error", error: error.message });

const Login = async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ message: "Missing Required Field" });
  }

  try {
    const user = await User.findOne({ Email });
    const passwordOk = user && (await compare(Password, user.Password));

    // same message for "no such user" and "wrong password"
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = sign(
      {
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
        Number: user.Number,
        ProfilePic: user.ProfilePic,
        Joining: user.Joining,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Successfully Logged In", token });
  } catch (error) {
    serverError(res, error);
  }
};

const Signup = async (req, res) => {
  const { Name, Email, Password, Number, Role, AdminCode } = req.body;

  if (!Name || !Email || !Password || !Number) {
    return res.status(400).json({ message: "Missing Required Field" });
  }
  if (String(Password).length < 6) {
    return res
    .status(400)
    .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const exists = await User.findOne({ Email });
    if (exists) {
      return res.status(409).json({ message: "User Already Exists" });
    }

    // Anyone can pick "user". Picking "admin" needs the secret code that is
    // stored in the ADMIN_SIGNUP_CODE environment variable (never in the code).
    let role = "user";
    if (String(Role).toLowerCase() === "admin") {
      const secret = process.env.ADMIN_SIGNUP_CODE;
      if (!secret || AdminCode !== secret) {
        return res.status(403).json({ message: "Invalid admin code" });
      }
      role = "admin";
    }

    await User.create({
      Name,
      Email,
      Number,
      Role: role,
      Password: await hash(Password, 12),
    });

    res.status(201).json({ message: "Successfully Created" });
  } catch (error) {
    serverError(res, error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-Password");
    res.json({ users });
  } catch (error) {
    serverError(res, error);
  }
};

// The logged-in user's own profile
const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-Password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    serverError(res, error);
  }
};

const userByID = async (req, res) => {
  const _id = req.params.id || req.query._id;

  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  // users can only look up themselves; admins can look up anyone
  if (String(req.user._id) !== String(_id) && !isAdmin(req.user)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  try {
    const user = await User.findById(_id).select("-Password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    serverError(res, error);
  }
};

// Users can only edit their own Name / Email / ProfilePic
const updateProfile = async (req, res) => {
  const { Email, Name, ProfilePic } = req.body;

  const update = {};
  if (Email) update.Email = Email;
  if (Name) update.Name = Name;
  if (ProfilePic !== undefined) update.ProfilePic = ProfilePic;

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
    }).select("-Password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Successfully Updated", user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    serverError(res, error);
  }
};

const deleteUser = async (req, res) => {
  const { _id } = req.body;

  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const result = await User.deleteOne({ _id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User Deleted Successfully" });
  } catch (error) {
    serverError(res, error);
  }
};

module.exports = {
  Login,
  Signup,
  deleteUser,
  updateProfile,
  userByID,
  getAllUsers,
  me,
};
