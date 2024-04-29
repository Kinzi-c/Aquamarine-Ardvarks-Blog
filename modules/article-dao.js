const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function createArticleData(articleData) {
    const db = await dbPromise;

    const result = await db.run(SQL`
        insert into articles (authorId, title, publicationDate, authorName, category ,description, content, imageName) values(${articleData.authorId}, ${articleData.title}, ${articleData.publicationDate},${articleData.authorName}, ${articleData.category}, ${articleData.description}, ${articleData.content}, ${articleData.imageName})`);

    articleData.id = result.id;
}

async function retrieveArticleDataById(id) {
    const db = await dbPromise;

    const articleData = await db.get(SQL`
        select * from articles
        where id = ${id}`);

    return articleData;
}

async function retrieveArticleDataByAuthor(authorName) {
    const db = await dbPromise;

    const articleData = await db.get(SQL`
        select * from articles
        where authorName = ${authorName}`);

    return articleData;
}

async function retrieveArticleDataByAuthorId(authorId) {
    const db = await dbPromise;

    const articleData = await db.all(SQL`
        select * from articles
        where authorId = ${authorId}`);

    return articleData;
}

async function retrieveArticleDataByCategory(category) {
    const db = await dbPromise;

    const articleData = await db.all(SQL`
        select * from articles
        where category = ${category}`);

    return articleData;
}

async function retrieveAllArticleData() {
    const db = await dbPromise;

    const allArticleData = await db.all(SQL`select * from articles`);

    return allArticleData;
}

async function updateArticleContent(articleData) {
    const db = await dbPromise;

    return await db.run(SQL`
        update articles
        set content = ${articleData.content}
        where id = ${articleData.id}`);
}

async function updateArticleTitle(articleData) {
    const db = await dbPromise;

    return await db.run(SQL`
        update articles
        set title = ${articleData.title}
        where id = ${articleData.id}`);
}

async function updateArticleDescription(articleData) {
    const db = await dbPromise;

    return await db.run(SQL`
        update articles
        set description = ${articleData.description}
        where id = ${articleData.id}`);
}

async function updateArticleImage(articleData) {
    const db = await dbPromise;

    return await db.run(SQL`
        update articles
        set imageName = ${articleData.imageName}
        where id = ${articleData.id}`);
}

async function deleteArticleData(id) {
    const db = await dbPromise;

    return await db.run(SQL`
        delete from articles
        where id = ${id}`);
}

async function sortbyOldestArticles() {
    const db = await dbPromise;

   return await db.all(SQL`
        select * 
        from articles
        order by publicationDate asc`);
}

async function sortbyNewestArticles() {
    const db = await dbPromise;

   return await db.all(SQL`
        select * 
        from articles
        order by publicationDate desc`);
}

// Export functions.
module.exports = {
    createArticleData,
    retrieveArticleDataById,
    retrieveArticleDataByAuthor,
    retrieveAllArticleData,
    updateArticleContent,
    updateArticleTitle,
    updateArticleDescription,
    updateArticleImage,
    retrieveArticleDataByAuthorId,
    retrieveArticleDataByCategory,
    sortbyOldestArticles,
    sortbyNewestArticles,
    deleteArticleData
};
