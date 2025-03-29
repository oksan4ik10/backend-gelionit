const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const errorHandler = require("../utils/errorHandler");
const config = require("../config/config");
const Worker = require("../models/Worker");
const Role = require("../models/Role");

module.exports.login = async (req, res) => {
  try {
    const candidate = await Worker.findOne({ login: req.body.login });
    if (candidate) {
      //   const passwordRes = bcrypt.compareSync(
      //     req.body.password,
      //     candidate.password
      //   );
      const passwordRes = candidate.password === req.body.password;
      if (passwordRes) {
        const token = jwt.sign(
          {
            userId: candidate._id,
          },
          config.keys,
          { expiresIn: 60 * 60 * 24 * 365 }
        );
        const role = await Role.findOne({ _id: candidate.idRole });
        res.status(200).json({
          access_token: `Bearer ${token}`,
          user: {
            role: role,
            id: candidate._id,
            name: candidate.name,
            busy: candidate.busy,
            salary: candidate.salary,
            is_admin: role.code === "admin",
          },
        });
      } else {
        res.status(401).json({
          message: "Пароль не верный. Попробуйте снова",
        });
      }
    } else {
      res.status(404).json({
        message: "Пользователь с таким логином не найден",
      });
    }
  } catch (e) {
    errorHandler(res, e);
  }
};
