import User from "../models/User.js";
import { createToken } from "../utils/tokens.js";

const sendAuth = (res, user) => {
  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  res.json({
    user: safeUser,
    token: createToken(user)
  });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "Admin" ? "Admin" : "Member"
    });

    res.status(201);
    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};
