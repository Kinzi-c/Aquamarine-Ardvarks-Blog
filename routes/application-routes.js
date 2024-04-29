const express = require("express");
const router = express.Router();

const multer = require("../middleware/multer-uploader.js");
const articleDao = require("../modules/article-dao.js");
const userDao = require("../modules/users-dao.js");
const commentDao = require("../modules/comment-dao.js");
const makeArray = require("../modules/make-array.js");

// Setup fs
const fs = require("fs");

// Setup jimp
const jimp = require("jimp");

//render the about view when navigating to /about
router.get("/about", async function(req, res) {

    res.render("about");
});

//render the new-article view when navigating to /newArticle
router.get("/newArticle", async function(req, res) {

    res.render("new-article");
});

// Populate the home page with all the available articles' cards and the featured article's info
router.get(["/home", "/"], async function(req, res) {
  
    let  allArticles;
    
    allArticles = await articleDao.retrieveAllArticleData();
       
    const articlesArray = makeArray(allArticles);
    //Get articles reading time
    readingTime(articlesArray);

    //Display all available articles as preview cards
    res.locals.allArticleData = articlesArray;

    if (articlesArray.length > 0) {
        
    
        await displayCards(res, articlesArray);
        // Display a random article as the featured article
        const randomArrayindex = getRandomInt(0, (articlesArray.length - 1));
        await displayFeaturedArticle(res, articlesArray, randomArrayindex);
    
        res.render("home");
    } else {
        console.log("Could not load...");
        res.redirect("/");
    } 
});

// Check if a user is logged in and fetch all of their articles to display them on their page
router.get("/profile", async function(req, res) {
   //check that the user is logged-in before giving access to their profile page
   if(res.locals.user){
    const userId = parseInt(res.locals.user.id);
    const user = await userDao.getUserWithId(userId);
    res.locals.userName = user.username;
        // check the logged-in user id and retrieve all of their articles
        const myArticles = await articleDao.retrieveArticleDataByAuthorId(userId);
        const articlesArray = makeArray(myArticles);
        readingTime(articlesArray);
        res.locals.myArticleData = articlesArray;

        res.render("profile");
    }else{
        res.redirect("/");
    }
});

// Process the image and all other fields from the new article form, create a new article and add it to the database
router.post("/newArticle", multer.single("imageFile"), async function(req, res){

    try{ 
        const fileInfo = req.file;

        // Move the image file to the uploadedFiles folder
        const oldFileName = fileInfo.path;
        const newFileName = `./public/images/uploadedFiles/${fileInfo.originalname}`;

        fs.renameSync(oldFileName, newFileName);

        // Write a copy of the uploaded image file in the images folder so that it is accessible for rendering on the home and profile views
        const image = await jimp.read(newFileName);

        await image.write(`./public/images/${fileInfo.originalname}`);

        // retrieve userId to get username
        const userId = parseInt(res.locals.user.id);
        const user = await userDao.getUserWithId(userId);
        const userName = user.username;


        // Make a JSON object with the data collected from the form
        const newArticle = processNewArticleForm(req.body, fileInfo.originalname, userName, userId);

        // Create a new article within the database
        await articleDao.createArticleData(newArticle);
        res.setToastMessage("Your new article is now live!");
        res.redirect("/profile");
    } catch(error){
        console.log(error);
        res.setToastMessage("\\*Please fill all of the required fields");
        res.redirect("/newArticle");
    }

});

// Retrieve an article using its id and send back the corresponding article from the db (if it exists)
router.get("/article", async function (req, res) {

    try{
        //Get the article id to retrieve its data in the database   
        const articleIdQuery = req.query.id;
        const articleId = parseInt(articleIdQuery);
        const article = await articleDao.retrieveArticleDataById(articleId);
        const authorData = await userDao.getUserWithId(article.authorId);
        article.authorName = `${authorData.fname} ${authorData.lname}`;
        const articleArray = makeArray(article);
        readingTime(articleArray);
        res.locals.readingTime= articleArray[0].readingTime;
        const comments = await commentDao.retrieveAllCommentsByArticleId(articleId);
        res.locals.comments = comments;
        res.locals.authorName = `${authorData.fname}, ${authorData.lname}`;
        if(res.locals.user){
            if(article.authorId == res.locals.user.id){
                res.locals.author = true;
            }
        }
        //Display article
        if(article != null){
            res.locals.imageName = article.imageName;
            res.locals.title = article.title;
            res.locals.publicationDate = article.publicationDate;
            res.locals.authorName = article.authorName;
            res.locals.category = article.category;
            res.locals.content = article.content;
            res.locals.id = article.id;

            res.render("article");
        }
    }
    catch(error){
        res.setToastMessage(`There are no article here!`);
        res.redirect("/");
    }
});

// Pre-fill the edit article form with the to be edited article's information
router.get("/editArticle", async function(req, res) {

    try{    
        const articleIdQuery = req.query.id;
        const articleId = parseInt(articleIdQuery);
        res.locals.id = articleId;
        req.body.id = articleId;
        const editedArticle = await articleDao.retrieveArticleDataById(articleId);

        if( editedArticle != undefined){
            res.locals.id = editedArticle.id;
            res.locals.title = editedArticle.title;
            res.locals.description = editedArticle.description;
            res.locals.content = editedArticle.content;
            res.locals.imageName = editedArticle.imageName;
        }

        res.render("edit-article");
    }catch(error){
        console.log(error);
        res.setToastMessage("something went wrong!");
        res.redirect("/");
    }
});

// Process the edit article form athen redirect to the profile page
router.post("/editArticle", multer.single("imageFile"), async function(req, res){
    // query the article id to populate the edit article form with the correct values
    const articleIdQuery = req.body.id;
    const articleId = parseInt(articleIdQuery);

    // retrieve userId to get username
    const userId =  parseInt(res.locals.user.id);
    try{ 
        const user = await userDao.getUserWithId(userId);
        const userName = user.username;
        
        // Make a JSON object with the data collected from the form
        const editedArticle = processEditedArticleForm(req.body, userName, userId, articleId);
        // update the relevant article with the info submitted in the form
        await articleDao.updateArticleTitle(editedArticle);
        await articleDao.updateArticleDescription(editedArticle);
        await articleDao.updateArticleContent(editedArticle);
        res.setToastMessage("Your edited article is now live!");
        res.redirect("/profile");
    } catch(error){
        console.log(error);
        res.setToastMessage("Oops! Something went wrong...");
        res.redirect(`/profile`);
    }

});

//Delete the corresponding article upon request 
router.get("/deleteArticle", async function(req, res) {
    const articleIdQuery = req.query.id;
    const articleId = parseInt(articleIdQuery);
    
   try {
    await articleDao.deleteArticleData(articleId);
    res.setToastMessage("Your article was successfully deleted!");
    res.redirect("/");
   } catch (error) {
        console.log(error);
        res.setToastMessage("something went wrong!");
        res.redirect("/");
   }
    
});

//Sort the articles by category or by date of publication
router.get("/sortArticle", async function(req, res) {
    let articlesArray
    //Sort articles by category
    if(req.query.category){
        const articleCategory = req.query.category;
        const allArticles = await articleDao.retrieveArticleDataByCategory(articleCategory);
        articlesArray = makeArray(allArticles);
    //Sort all articles by dates     
    }else if(req.query.sort){
        const articleSort = req.query.sort;
        if(articleSort == "latest"){
            const allArticles = await articleDao.sortbyNewestArticles();
            articlesArray = makeArray(allArticles);
        }else if(articleSort == "oldest"){
            const allArticles = await articleDao.sortbyOldestArticles();
            articlesArray = makeArray(allArticles);
        }else{console.log("error")}
    }else{console.log("error")}

    //Display all available articles in the selected category as preview cards
    res.locals.allArticleData = articlesArray;

    if (articlesArray.length > 0) {
        await displayCards(res,articlesArray);

        // Display a random article as the featured article
        const randomArrayindex = getRandomInt(0, (articlesArray.length - 1));
        await displayFeaturedArticle(res, articlesArray, randomArrayindex)
        //render home view
        res.render("home");
    } else {
        res.setToastMessage("There are no articles available in this category.");
        res.redirect("/");
    } 
      
});

// Post requests for comments submitted on articles.
router.post("/comment", async function (req, res) {
    const date = new Date();
    const commentData = {"message": req.body.message, "datePosted":date.getDate(), "userId":res.locals.user.id, "articleId":req.body.articleId}
    await commentDao.createCommentData(commentData);
    res.redirect("/");
});

// Populate all the articles' card from the articles array fed as a parameter with the relevant article's info
async function displayCards(res, articlesArray){
 
    for (let index = 0; index < articlesArray.length; index++) {
        const article = articlesArray[index];

        res.locals.timeStamp = article.publicationDate;
        res.locals.imageName = article.imageName;
        res.locals.id = article.id;
        res.locals.title = article.title;
        res.locals.category = article.category;

        const authorData = await userDao.getUserWithId(article.authorId);
        article.authorName = `${authorData.fname} ${authorData.lname}`;

        res.locals.authorName = `${authorData.fname}, ${authorData.lname}`;
        res.locals.authorName = article.authorName;
        res.locals.descritpion = article.description; 

    }
}

//Display featured article based off the given article array and random array index generated and passed as parameters
async function displayFeaturedArticle(res, articlesArray, randomArrayindex) {

    const randomArticle = articlesArray[randomArrayindex];

    res.locals.featuredImage = randomArticle.imageName;
    res.locals.featuredTitle = randomArticle.title;
    res.locals.id = randomArticle.id;

    res.locals.numDays = lapsedTime(randomArticle.publicationDate);
    const featuredAuthorData = await userDao.getUserWithId(randomArticle.authorId);
    randomArticle.authorName = `${featuredAuthorData.fname} ${featuredAuthorData.lname}`;
    res.locals.featuredAuthor = randomArticle.authorName;
    res.locals.featuredDescription = randomArticle.description;
}

//Return a article JSON object using the req.body and the uploaded image's original name as the parametre.
function processNewArticleForm(data, imageUrl, userName, userId) {
    //pass the current date as the article's publication date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    
    today = `${yyyy}-${mm}-${dd}`;
    const response = {
        authorId: userId,
        title: data.title,
        publicationDate: today,
        authorName: userName,
        category: data.category,
        imageName: imageUrl,
        description: data.description,
        content: data.content
    }

    return response;
}

// Generate a random integer comprised between the two values passed in the parametre.
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Return a article JSON object using the req.body and the uploaded image's original name as the parametre.
function processEditedArticleForm(data, userName, userId, id) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    
    today = `${yyyy}-${mm}-${dd}`;
    const response = {
        id: id,
        authorId: userId,
        title: data.title,
        publicationDate: today,
        authorName: userName,
        description: data.description,
        content: data.content
    }
  
    return response;
}

//Get day difference between today and the article publication date passed as a parametre
function lapsedTime(publicationDate){
    const date = new Date();
    const dt = new Date(publicationDate);
    //get the difference between today and publication date in milliseconds
    const difference = date.getTime() - dt.getTime();
    //Convert milliseconds to days
    const totalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return totalDays;
}

// Calculate reading time on average reading speed of 200 words per minute
function readingTime(articlesArray){
    articlesArray.forEach(function(item,index){
        const readingTime = articlesArray[index].readingTime = Math.round(item.content.split(' ').length / 200);
        return readingTime;
    })
}

module.exports = router;