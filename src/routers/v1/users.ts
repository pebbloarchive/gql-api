import { Router, Request, Response } from 'express';
import session from '../../middleware/session';
const router = Router();
const { messages } = require('../../utils.json');
import { v4 as uuid } from 'uuid';
import short from 'short-uuid';

router.get('/@me', session, async (req, res) => {
    try {
        // @ts-ignore
        const user = await db.users.findOne({ id: req.user.id });
        if(!user) return res.status(400).send({ error: "Unknown User" });
        return res.status(200).send({
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            email: user.email,
            created_at: user.registered_at,
            permissions: user.permissions,
            connections: user.connections,
            followingCount: user.following.length,
            followersCount: user.followers.length
        });
    } catch(err) {
        return res.status(400).send({ error: 'Something went wrong, please try again.' });
    }   
});

router.get('/get/:id', session, async (req, res) => {
    try {
        // @ts-ignore
       const user = await db.users.findOne({ id: req.params.id });
       // if(!req.params.id.match(/[0-9]/)) return res.status(400).send({ error: `Value "${req.params.id}" is not a snowflake.` });
       if(!user) return res.status(400).send({ error: `Unknown User` });
    //    const posts = await db.posts.find
       if(user) {
         return res.status(200).send({
            username: user.username,
            avatar: user.avatar,
            created_at: user.registered_at,
            followingCount: user.following.length,
            followersCount: user.followers.length
        });
      }
    } catch(err) {
        return res.status(400).send({ error: 'Something went wrong, please try again.' });
    }
});

router.get('/@me/relationships', session, async (req, res) => {
    try {
        // @ts-ignore
        const data = await db.users.findOne({ id: req.user.id });
        return res.status(200).json({ following: data.following, blocked: data.blocked });
    } catch(err) {
        res.status(400).send({ error: messages.fallback_error });
    }
});

router.get('/@me/settings', session, async (req, res) => {
    try {
        // @ts-ignore
        const data = await db.users.findOne({ id: req.user.id });
        return res.status(200).send({ 
            theme: data.theme,
            mfa_enabled: data.mfa_enabled
        });
    } catch(err) {
        res.status(400).send({ error: messages.fallback_error });
    }
});

router.post('/posts/new', session, async (req, res) => {
    let { content, attachments } = req.body;
    if(!attachments) attachments = [];
    if(!content || content.length < 1) return res.status(400).json({ error: 'No content was provided' });
    if(content.length > 2000) return res.status(401).send({ error: 'Unable to create new post, due to content length being over 2000 characters' });
    try {
        const id = short.generate();
        const date = new Date().toISOString();
        const data = { 
        // @ts-ignore
            id: id, author: req.user.id, content: content, attachments: attachments, likes: [], shares: [], created_at: date
        }
        // @ts-ignore
        await db.posts.insertOne({ id: id, author: req.user.id, content: content, attachments: attachments, likes: [], shares: [], created_at: date });
        return res.status(201).send({ message: 'Successfully created new post', result: data });
    } catch(err) {
        return res.status(400).send({ error: 'Unable to create new post' });
    }
});

router.post('/posts/comment/:id', session, async (req, res) => {
    // @ts-ignore
    const post = await db.posts.findOne({ id: req.params.id });
    if(!post) return res.status(400).send({ error: 'Unable to find that post' });

    if(req.body.content.length > 2000) res.status(400).send({ error: `Unable to edit post due to content being longer than 2000 characters. 2000/${req.body.content.length - 2000}` });

    try {
        const id = short.generate();
        const date = new Date().toISOString();
        const data = {
            original: req.params.id, 
            id: id,
            // @ts-ignore
            author: req.user.id,
            content: req.body.content,
            likes: [],
            shares: [],
            created_at: date
        }
        // @ts-ignore
        await db.posts.insertOne({ original: req.params.id, id: id, author: req.user.id, content: req.body.content, likes: [], shares: [], created_at: date });
       return res.status(200).send({ message: 'Successfully created new sub-post', result: data });
    } catch(err) {
        return res.status(400).send({ error: 'Unable to comemnt on that post' });
    }
});

router.post('/posts/edit/:id', session, async (req, res) => {
    // @ts-ignore
    const post = await db.posts.findOne({ id: req.params.id });
    if(!post) return res.status(400).send({ error: 'Unable to find that post' });
    // @ts-ignore
    if(post.author != req.user.id) return res.status(400).send({ error: 'Unable to edit post due to invalid permissions' });

    if(post.content === req.body.content) return res.status(400).send({ error: 'Unable to edit that post, because it has the same content as before' });

    if(req.body.content.length > 2000) res.status(400).send({ error: `Unable to edit post due to content being longer than 2000 characters. 2000/${req.body.content.length - 2000}` });
    try {
        const data = {
            content: req.body.content,
            updated_at: new Date().toISOString()
        }
        // @ts-ignore
        await db.posts.updateOne({ id: post.id }, { $set: data })
        return res.status(200).send({ message: 'Successfully updated post' });
    } catch(err) {
        return res.status(400).send({ error: 'Unable to create new post' });
    }
});

router.delete('/posts/:id', session, async (req, res) => {
    // @ts-ignore
    const post = await db.posts.findOne({ id: req.params.id });
    if(!post) return res.status(400).send({ error: 'Unable to find that post' });

    // @ts-ignore
    if(post.author != req.user.id) return res.status(400).send({ error: 'Unable to delete post due to invalid permissions' });
    try {
        // @ts-ignore
        await db.posts.deleteMany({ original: req.params.id });
        // @ts-ignore
        await db.posts.deleteOne({ id: req.params.id });
        return res.status(400).send({ message: 'Successfully deleted post' });
    } catch(err) {
        return res.status(400).send({ error: 'Unable to delete post due to invalid permissions' });
    }
});

router.post('/follow/:id', session, async (req, res) => {
    // @ts-ignore
    const account = await db.users.findOne({ id: req.params.id });
    if(!account) return res.status(404).send({ error: 'Unknown user' });
    if(account.suspended) return res.status(401).send({ error: 'Unable to follow that user, due to their account being suspended' });
    // @ts-ignore
    if(account.followers.includes(req.user.id)) return res.status(401).send({ error: 'You\'re already following that user' })
    // if(account.is_private) return res.status(401).send({ error: 'Unable to follow that user, due to their account being private' });
    try {
        // @ts-ignore
        await db.users.updateOne({ id: req.params.id }, { $push: { followers: req.user.id } });
        // @ts-ignore
        await db.users.updateOne({ id: req.user.id }, { $push: { following: req.params.id } });      
        return res.status(200).send({ success: true });  
    } catch(err) {
        return res.status(400).send({ error: 'Something went wrong, please try again' });
    }
});

router.delete('/unfollow/:id', session, async (req, res) => {
    // @ts-ignore
    const account = await db.users.findOne({ id: req.params.id });
    if(!account) return res.status(404).send({ error: 'Unknown user' });
    // @ts-ignore
    if(!account.followers.includes(req.user.id)) return res.status(404).send({ error: 'Unable to unfollow that person, because you\'re not following them'  });
    try {
        // @ts-ignore
        await db.users.updateOne({ id: req.params.id }, { $pull: { followers: req.user.id } });
        // @ts-ignore
        await db.users.updateOne({ id: req.user.id }, { $pull: { following: req.params.id } });      
        return res.status(200).send({ success: true });  
    } catch(err) {
        return res.status(400).send({ error: 'Something went wrong, please try again' });
    }
});

router.post('/block/:id', session, async (req, res) => {
    // @ts-ignore
    const account = await db.users.findOne({ id: req.params.id });
    if(!account) return res.status(404).send({ error: 'Unknown user' });
    if(account.suspended) return res.status(401).send({ error: 'Unable to block that user, due to their account being suspended' });
    // @ts-ignore
    if(account.blocked.includes(req.user.id)) return res.status(401).send({ error: 'This user is already blocked' });
    // if(account.is_private) return res.status(401).send({ error: 'Unable to follow that user, due to their account being private' });
    try {
        // @ts-ignore
        await db.users.updateOne({ id: req.params.id }, { $push: { followers: req.user.id } });
        // @ts-ignore
        await db.users.updateOne({ id: req.user.id }, { $push: { following: req.params.id } });      
        return res.status(200).send({ success: true });  
    } catch(err) {
        return res.status(400).send({ error: 'Something went wrong, please try again' });
    }
});

export default router;

