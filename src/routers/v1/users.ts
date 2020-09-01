import { Router, Request, Response } from 'express';
import session from '../../middleware/session';
import { COMMON_ERROR, INVALID_INFO, INVALID_USER } from '../../constants';

const router = Router();

router.get('/@me', session, async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = await db.users.findOne({ id: req.user.id });
        if(!user) return res.status(400).send({ error: "Unknown User" });
        return res.status(200).send({
            id: user.id,
            username: user.username,
            name: user.name,
            description: user.description,
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

router.get('/:id', async (req: Request, res: Response) => {
    try {
        // @ts-ignore
    //    const user = await db.users.findOne({ username: req.params.id });
       const user = await db.users.findOne({ username: req.params.id }, {"collation" : {"locale" : "en_US", "strength": 2 }})
       console.log(user)
       if(!user) return res.status(400).send({ error: `Unknown User` });
       // @ts-ignore
       const posts = await db.posts.find({ author: user.id }).toArray();
       posts.forEach(post => delete post._id);
       if(user) {
         return res.status(200).send({
            id: user.id,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            description: user.description,
            permissions: user.permissions,
            private: user.is_private,
            suspended: user.suspended,
            created_at: user.registered_at,
            followingCount: user.following.length,
            followersCount: user.followers.length,
            posts: posts.filter(post => post.type === 'post')
        });
      }
    } catch(err) {
        return res.status(400).send({ error: 'Something went wrong, please try again.', err: err.stack });
    }
});

router.get('/:id/posts', session, async (req: Request, res: Response) => {
    try {
        // @ts-ignore
       const user = await db.users.findOne({ username: req.params.id });
       // if(!req.params.id.match(/[0-9]/)) return res.status(400).send({ error: `Value "${req.params.id}" is not a snowflake.` });
       if(!user) return res.status(400).send({ error: `Unknown User` });
       // @ts-ignore
       const posts = await db.posts.find({ author: user.id }).toArray();
       posts.forEach(post => delete post._id);
       if(user) {
         return res.status(200).send({
            id: user.id,
            username: user.username,
            posts: posts.filter(post => post.type === 'post')
        });
      }
    } catch(err) {
        return res.status(400).send({ error: 'Something went wrong, please try again.', err: err.stack });
    }
});

router.get('/@me/relationships', session, async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const data = await db.users.findOne({ id: req.user.id });
        return res.status(200).json({ following: data.following, followers: data.followers, blocked: data.blocked });
    } catch(err) {
        res.status(400).send({ error: COMMON_ERROR });
    }
});

router.get('/@me/settings', session, async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const data = await db.users.findOne({ id: req.user.id });
        return res.status(200).send({ 
            theme: data.theme,
            mfa_enabled: data.mfa_enabled
        });
    } catch(err) {
        res.status(400).send({ error: COMMON_ERROR });
    }
});

router.get('/posts/:id', async(req: Request, res: Response) => {
    if(!req.params.id) return res.status(400).send({ error: COMMON_ERROR });
    // @ts-ignore
    const postId = await db.posts.findOne({ id: req.params.id });
    if(!postId) return res.status(400).send({ error: COMMON_ERROR });
    // @ts-ignore
    let user = await db.users.findOne({ id: postId.author });
    try {
        await res.status(200).send({
            id: postId.id,
            author: postId.author,
            author_info: {
                name: user.name,
                username: user.username,
                avatar: user.avatar
            },
            original: postId.original,
            content: postId.content,
            attachments: postId.attachments,
            likes: postId.likes,
            shares: postId.shares,
            created_at: postId.created_at,
            updated_at: postId.updated_at
        });
    } catch(err) {
        return res.status(400).send({ error: COMMON_ERROR });
    }
});

router.post('/posts/new', session, async (req: Request, res: Response) => {
    let { content, attachments } = req.body;
    if(!attachments) attachments = [];
    if(!content || content.length < 1) return res.status(400).json({ error: 'No content was provided' });
    if(content.length > 2000) return res.status(401).send({ error: 'Unable to create new post, due to content length being over 2000 characters' });
    try {
        // const id = short.generate();
        // @ts-ignore
        const id = flake.generate(); 
        const date = new Date().toISOString();
        const data = { 
        // @ts-ignore
            id: id, author: req.user.id, content: content, attachments: attachments, likes: [], shares: [], created_at: date, type: 'post'
        }
        // @ts-ignore
        await db.posts.insertOne({ id: id, author: req.user.id, content: content, attachments: attachments, likes: [], shares: [], created_at: date, type: 'post' });
        return res.status(201).send({ message: 'Successfully created new post', result: data });
    } catch(err) {
        return res.status(400).send({ error: 'Unable to create new post' });
    }
});

router.post('/posts/comment/:id', session, async (req: Request, res: Response) => {
    // @ts-ignore
    const post = await db.posts.findOne({ id: req.params.id });
    if(!post) return res.status(400).send({ error: 'Unable to find that post' });

    if(req.body.content.length > 2000) res.status(400).send({ error: `Unable to edit post due to content being longer than 2000 characters. 2000/${req.body.content.length - 2000}` });

    try {
        // const id = short.generate();
        // @ts-ignore
        const id = flake.generate(); 
        const date = new Date().toISOString();
        const data = {
            original: req.params.id, 
            id: id,
            // @ts-ignore
            author: req.user.id,
            content: req.body.content,
            likes: [],
            shares: [],
            created_at: date,
            type: 'comment'
        }
        // @ts-ignore
        await db.posts.insertOne({ original: req.params.id, id: id, author: req.user.id, content: req.body.content, likes: [], shares: [], created_at: date, type: 'comment' });
       return res.status(200).send({ message: 'Successfully created new sub-post', result: data });
    } catch(err) {
        return res.status(400).send({ error: 'Unable to comemnt on that post' });
    }
});

router.put('/posts/:id/like', session, async (req: Request, res: Response) => {
    if(!req.params.id) return res.status(400).send({ error: COMMON_ERROR });
    // @ts-ignore
    let postId = await db.posts.findOne({ id: req.params.id });
    if(!postId) return res.status(400).send({ error: COMMON_ERROR }); // if the specified postId is not found then throw an error
    // @ts-ignore
    // if(postId.type === 'post' && req.user.id === postId.author) return res.status(400).send({ error: 'You\re unable to like your own post' }) // TODO: make an actual error for this context.
    // @ts-ignore
    if(postId.likes.includes(req.user.id)) return res.status(400).send({ error: 'Unable to that post, you have already liked it' });
    try {
        // @ts-ignore
        const like = await db.posts.updateOne({ id: postId.id }, { $push : { likes: req.user.id } })
        await res.status(200).send({
            id: postId.id,
            author: postId.author,
            original: postId.original,
            content: postId.content,
            attachments: postId.attachments,
            likes: postId.likes,
            shares: postId.shares,
            created_at: postId.created_at,
            updated_at: postId.updated_at
        });
    } catch(err) {
        return res.status(400).send({ error: COMMON_ERROR });
    }
});

router.put('/posts/:id/unlike', session, async (req: Request, res: Response) => {
    if(!req.params.id) return res.status(400).send({ error: COMMON_ERROR });
    // @ts-ignore
    let postId = await db.posts.findOne({ id: req.params.id });
    if(!postId) return res.status(400).send({ error: COMMON_ERROR }); // if the specified postId is not found then throw an error
    // @ts-ignore
    if(postId.type === 'post' && req.user.id === postId.author) return res.status(400).send({ error: COMMON_ERROR }) // TODO: make an actual error for this context.
    try {
        // @ts-ignore
        const like = await db.posts.updateOne({ id: postId.id }, { $pull : { likes: req.user.id } })
        await res.status(200).send({
            id: postId.id,
            author: postId.author,
            original: postId.original,
            content: postId.content,
            attachments: postId.attachments,
            likes: postId.likes,
            shares: postId.shares,
            created_at: postId.created_at,
            updated_at: postId.updated_at
        });
    } catch(err) {
        return res.status(400).send({ error: COMMON_ERROR });
    }
});

router.post('/posts/edit/:id', session, async (req: Request, res: Response) => {
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

router.delete('/posts/:id', session, async (req: Request, res: Response) => {
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

router.post('/follow/:id', session, async (req: Request, res: Response) => {
    // @ts-ignore
    const account = await db.users.findOne({ id: req.params.id });
    if(!account) return res.status(404).send({ error: 'Unknown user' });
    // @ts-ignore
    if(req.user.id === account.id) return res.status(401).send({ error: 'You\'re unable to follow yourself.' });
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
        return res.status(400).send({ error: COMMON_ERROR });
    }
});

router.get('/followers/:id', session, async (req: Request, res: Response) => {
    // @ts-ignore
    const account = await db.users.findOne({ id: req.params.id });
    if(!account) return res.status(404).send({ error: 'Unknown user' });
    try {
        return res.status(200).send({ followers: account.followers });  
    } catch(err) {
        return res.status(400).send({ error: COMMON_ERROR });
    }
});

router.delete('/unfollow/:id', session, async (req: Request, res: Response) => {
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

router.post('/block/:id', session, async (req: Request, res: Response) => {
    // @ts-ignore
    const account = await db.users.findOne({ id: req.params.id });
    if(!account) return res.status(404).send({ error: 'Unknown user' });
    if(account.suspended) return res.status(401).send({ error: 'Unable to block that user, due to their account being suspended' });
    // @ts-ignore
    if(account.blocked.includes(req.user.id)) return res.status(401).send({ error: 'This user is already blocked' });
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

router.patch('/update/settings', session, async (req: Request, res: Response) => {
    let { is_private, allow_comment, followers, outside_messages, scan_messages, scan_media } = req.body;
    // if(!is_private || !allow_comment || !followers || !outside_messages || !scan_messages || !scan_media) return res.status(400).send({ error: INVALID_INFO });
    // @ts-ignore
    const user = await db.users.findOne({ id: req.user.id });
    if(!user) return res.status(404).send({ error: INVALID_USER });
    // if(!Number(is_private) || !Number(allow_comment) || !Number(followers) || !Number(outside_messages) || !Number(scan_messages) || !Number(scan_media)) return res.status(400).send({ error: 'Body must equal an integer.' });
    let data;
    try {
        if(is_private) {
            if(typeof is_private !== 'boolean') return res.status(200).send({ error: 'is_private can only be a boolean' });
        }
        if(allow_comment) data = allow_comment;
        if(followers) data = followers;
        if(outside_messages) data = outside_messages;
        if(scan_messages) data = scan_messages;
        if(scan_media) data = scan_media;
        // @ts-ignore
        await db.users.updateOne({ id: req.user.id }, { $set : { privacy: data }});
        return res.status(200).json(data);
    } catch(err) {
        return res.status(400).send({ error: COMMON_ERROR });
    }
});

export default router;
