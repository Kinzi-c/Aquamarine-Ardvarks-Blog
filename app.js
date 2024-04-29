/**
 * Main application file.
 * 
 * NOTE: This file contains many required packages, but not all of them - you may need to add more!
 */

// Setup Express
const express = require("express");
const app = express();
const port = 3000;

// Setup Handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Setup body-parser
app.use(express.urlencoded({ extended: false }));

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//Setup multer
const multer = require("./middleware/multer-uploader.js");

// Setup fs
const fs = require("fs");

// Setup jimp
const jimp = require("jimp");

// fixing "413 Request Entity Too Large" errors
app.use(express.json({limit: "10mb", extended: true}))
app.use(express.urlencoded({limit: "10mb", extended: true, parameterLimit: 50000}))


// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// serve the uploaded images from ./images folder at "./images"
app.use("/images", express.static("images"));

// handle image upload using multer and return the `imageUrl` as response 
app.post("/upload-image", multer.single("image"),async function(req, res){

    const fileInfo = req.file;

    // Move the image file to the uploadedFiles folder
    const oldFileName = fileInfo.path;
    const newFileName = `./public/images/uploadedFiles/${fileInfo.originalname}`;

    fs.renameSync(oldFileName, newFileName);

    // Write a copy of the uploaded image file in the images folder so that it is accessible for rendering on the home and profile views
    const image = await jimp.read(newFileName);

    image.write(`./public/images/${fileInfo.originalname}`);
    
(request, response) => {
  response.send({
    imageUrl: `${newFileName}/${oldFileName}`,
  });
}
});

// Use the toaster middleware
const authMiddleware = require("./middleware/authentication-middleware.js");
const addUser = authMiddleware.addUserToLocals;
const verify = authMiddleware.verifyAuthenticated;
app.use(require("./middleware/toaster-middleware.js"));
app.use(addUser);
app.use(verify);

// New Route to the TinyMCE Node module
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// Setup routes
app.use(require("./routes/application-routes.js"));
app.use(require("./routes/authenticationRoutes.js"));

// Get the uploaded image and text typed in the TinyMCE editor if any
app.post("/newArticle", async function(req, res) {
    await tinymce.get("article").uploadImages();
    req.body.content = tinymce.get("article").getContent;
   
});

// Set the tinyMCE text area's text to the content of the article to be edited
app.get("/editArticle", function(req, res){

    if(res.locals.content){
        tinymce.get("article").setContent(`${res.locals.content}`);
        }

});

// Get the uploaded image and text typed in the TinyMCE editor if any
app.post("/editArticle", async function(req, res) {
    await tinymce.get("article").uploadImages();
    req.body.content = tinymce.get("article").getContent;
   
});

// Start the server running.
app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});

