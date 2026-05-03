const prisma = require("../prisma");
const bcrypt = require("bcrypt");

const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

module.exports = {
  createUser,
  findUserByEmail,
};