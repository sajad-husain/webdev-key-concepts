import path from "node:path"
import process from "node:process"





// uploads/users/43/profile.photo.png

const userUploads = process.cwd()
const userId = "43"
const profilePhoto = "profile.photo.png"

const originalFilePath = path.join(userUploads, "users", userId, profilePhoto)
console.log("Original Path",originalFilePath)
console.log("Root",userUploads)

const extName = path.extname(originalFilePath)
console.log("Extension",extName);

const rootFolder = path.dirname(originalFilePath)
console.log("Folder",rootFolder);

const childFile = path.basename(originalFilePath)
console.log("File",childFile);



