/* eslint-disable no-await-in-loop */
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentArray = await this._commentRepository.getCommentsByThreadId(threadId);
    const detailComment = [];
    for (let i = 0; i < commentArray.length; i++) {
      detailComment.push(new DetailComment({
        id: commentArray[i].id,
        username: commentArray[i].username,
        date: commentArray[i].date,
        content: commentArray[i].is_deleted ? '**komentar telah dihapus**' : commentArray[i].content,
      }));
    }
    thread.comments = detailComment;
    return thread;
  }
}

module.exports = GetDetailThreadUseCase;
