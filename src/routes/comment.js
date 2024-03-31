import express from 'express'
import { deleteCommentRecursive, getAll as getAllRecursive } from '../controllers/commentRecursive'
import { getAll, create, deleteComment, reply } from '../controllers/comment'
const routerComment = express.Router()

routerComment.get('/', getAll)
routerComment.get('/recursive', getAllRecursive)

routerComment.post('/', create)
routerComment.post('/reply', reply)
routerComment.delete('/:id', deleteComment)
routerComment.delete('/recursive/:id', deleteCommentRecursive)

export default routerComment
