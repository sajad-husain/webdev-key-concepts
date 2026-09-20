// ============================================================
// Path module — join, dirname, basename, extname, resolve
// Started: 2026-08-02   Finished: 2026-08-02
// ============================================================

import path from "node:path"
import process from "node:process"

// path module builds and reads file path
// we use path.join method bacause it adds suitable seperators according to os.



// uploads/users/43/profile.photo.png

const userUploads = process.cwd()
const userId = "43"
const profilePhoto = "profile.photo.png"

// path.join()
// create a path string, never create a folder
// don't check whether files exist or not

const originalFilePath = path.join(userUploads, "users", userId, profilePhoto)
console.log("Original Path",originalFilePath)
console.log("Root",userUploads)

const extName = path.extname(originalFilePath)
console.log("Extension",extName);

const rootFolder = path.dirname(originalFilePath)
console.log("Folder",rootFolder);

const childFile = path.basename(originalFilePath)
console.log("File",childFile);



