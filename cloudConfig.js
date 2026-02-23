const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});//used to authenticate and acess cloud storage 

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "stayscape_DEV",
    allowedFormats: ["png", "jpg", "jpeg"],
  },
}); // upwards is folder where data will be stored in cloud

module.exports = { cloudinary, storage };
