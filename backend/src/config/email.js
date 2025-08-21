import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gracehuang2792004@gmail.com",
    pass: "xfqbepfoptddomkw",
  },
});

export default transporter;
