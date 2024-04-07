import express from 'express'
import { deleteCommentRecursive, getAllByMovie, getAll as getAllRecursive } from '../controllers/commentRecursive'
import { getAll, create, deleteComment, reply, likeComment } from '../controllers/comment'
const routerComment = express.Router()

routerComment.get('/', getAll)
routerComment.get('/recursive', getAllRecursive)
routerComment.get('/recursive/:id', getAllByMovie)

routerComment.post('/', create)

routerComment.post('/reply', reply)
routerComment.patch('/like/:id', likeComment)
routerComment.delete('/:id', deleteComment)
routerComment.delete('/recursive/:id', deleteCommentRecursive)

export default routerComment
