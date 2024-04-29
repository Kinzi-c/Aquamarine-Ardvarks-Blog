const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function createCommentData(commentData) {
    const db = await dbPromise;

    const result = await db.run(SQL`
        insert into comments (message, datePosted, userId,articleId) values(${commentData.message}, ${commentData.datePosted}, ${commentData.userId}, ${commentData.articleId})`);

    commentData.id = result.id;
}

async function retrieveCommentDataById(id) {
    const db = await dbPromise;

    const commentData = await db.get(SQL`
        select * from comments
        where id = ${id}`);

    return commentData;
}

async function retrieveCommentDataByMessage(message) {
    const db = await dbPromise;

    const commentData = await db.get(SQL`
        select * from comments
        where message = ${message}`);

    return commentData;
}

async function retrieveCommentDataByDatePosted(datePosted) {
    const db = await dbPromise;

    const commentData = await db.get(SQL`
        select * from comments
        where datePosted = ${datePosted}`);

    return commentData;
}

async function retrieveCommentDataByUserId(userId) {
    const db = await dbPromise;

    const commentData = await db.get(SQL`
        select * from comments
        where userId = ${userId}`);

    return commentData;
}

async function retrieveAllCommentsByArticleId(articleId) {
    const db = await dbPromise;

    const commentData = await db.all(SQL`
    select message, userId, articleId, username FROM comments AS c INNER JOIN users AS u ON c.userId = u.id AND c.articleId = ${articleId}`);

    return commentData;
}

async function retrieveAllCommentData() {
    const db = await dbPromise;

    const allCommentData = await db.all(SQL`select * from comments`);

    return allCommentData;
}

async function updateCommentMessage(commentData) {
    const db = await dbPromise;

    return await db.run(SQL`
        update comments
        set message = ${commentData.message}
        where id = ${commentData.id}`);
}

async function updateCommentDatePosted(commentData) {
    const db = await dbPromise;

    return await db.run(SQL`
        update comments
        set datePosted = ${commentData.datePosted}
        where id = ${commentData.id}`);
}

async function deleteCommentData(id) {
    const db = await dbPromise;

    return await db.run(SQL`
        delete from comments
        where id = ${id}`);
}

// Export functions.
module.exports = {
    createCommentData,
    retrieveCommentDataById,
    retrieveCommentDataByMessage,
    retrieveCommentDataByDatePosted,
    retrieveCommentDataByUserId,
    retrieveAllCommentsByArticleId,
    retrieveAllCommentData,
    updateCommentMessage,
    updateCommentDatePosted,
    deleteCommentData
};
