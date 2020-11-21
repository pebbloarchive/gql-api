import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entites/Post";
import { MyContext } from "../types";
import uuid from 'short-uuid';
import { FileUpload, GraphQLUpload } from "graphql-upload"
import { isAuthed } from "../middleware/isAuthed";
import { ApolloError } from "apollo-server-express";
import { User } from "../entites/user";

// TODO: add the ability to edit posts and subs.

interface OwnerType {
    id: string
    verified: boolean;
    username: string
}        

interface post {
    id: string;
    owner: OwnerType;
    content: string;
    createdAt: string;
}

@ObjectType()
class FieldErrors {
    @Field() field!: string;
    @Field() message!: string;
}

@ObjectType()
class PostResponse {
    @Field(() => [FieldErrors], { nullable: true }) errors?: FieldErrors[];
    @Field(() => Post, { nullable: true }) post?: Post;
}

@InputType()
class PostInput {
    @Field() content!: string;
    @Field(() => [GraphQLUpload]) attachments!: Promise<FileUpload>[];
}

@InputType()
class PinPostInput {
    @Field(() => String) id!: string;
}

@InputType()
class SharePostInput {
    @Field(() => String) id!: string;
}

@Resolver()
export class PostResolver {
    @UseMiddleware(isAuthed)
    @Query(() => [Post])
    posts(
        @Ctx() { req, em }: MyContext
    ): Promise<Post[]> {
        return em.find(Post, { author: req.session.userId });
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg('id') id: string,
        @Ctx() { em }: MyContext
        ): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @UseMiddleware(isAuthed)
    @Mutation(() => PostResponse)
    async commentPost(
        @Arg('id') id: string,
        @Arg('content') content: string,
        @Ctx() { em, req }: MyContext
    ): Promise<PostResponse> {
        const post = await em.findOne(Post, { id });
        const user = await em.findOne(User, { id: req.session.userId });

        if(!post) return {
            errors: [
                {
                    field: "post",
                    message: "That post was unable to be found."
                }
            ]
        }

        const commenter = {
            id: uuid.generate(),
            owner: {
                id: req.session.userId,
                verified: user.verified,
                username: user.username
            },
            content: content,
            createdAt: new Date()
        }

        post.subs.push(commenter);

        await em.persistAndFlush(post);
        return { post };
    }

    @UseMiddleware(isAuthed)
    @Mutation(() => PostResponse)
    async deleteSub(
        @Arg('id') id: string,
        @Arg('subid') subid: string,
        @Ctx() { em, req }: MyContext
    ): Promise<PostResponse> {
        const post = await em.findOne(Post, { id });

        if(!post) return {
            errors: [
                {
                    field: "post",
                    message: "That post was unable to be found."
                }
            ]
        }

        // @ts-ignore
        const postId: post = post.subs.find(id => id.id === subid)

        if(!postId) return {
            errors: [
                {
                    field: "post",
                    message: "That sub was unable to be found."
                }
            ]
        }

        if(req.session.userId !== postId.owner.id) return {
            errors: [
                {
                    field: "post",
                    message: "Unable to delete sub because ID's don't match."
                }
            ]
        }

        // @ts-ignore
        post.subs = post.subs.filter(id => id.id != subid)

        await em.persistAndFlush(post);
        return { post };
    }    

    @UseMiddleware(isAuthed)
    @Mutation(() => Post)
    async createPost(
        @Arg('content') content: string,
        @Ctx() { em, req }: MyContext
    ): Promise<Post> {
        const post = em.create(Post, { content, id: uuid.generate(), author: req.session.userId, subs: [] });
        await em.persistAndFlush(post);
        return post;
    }


    @UseMiddleware(isAuthed)
    @Mutation(() => PostResponse, { nullable: true })
    async updatePost(
        @Arg("id") id: string,
        @Arg("content", () => String, { nullable: true }) content: string,
        @Ctx() { req, em }: MyContext
    ): Promise<PostResponse | null> {
        const post = await em.findOne(Post, { id });

        if(req.session.userId !== post.author) return {
            errors: [
                {
                    field: "post",
                    message: "You're missing permissions to update this post."
                }
            ]
        }

        if(!post) return null;
        if(typeof post !== 'undefined') {
            post.content = content;
            await em.persistAndFlush(post);
        }
        return { post };
    }

    @UseMiddleware(isAuthed)
    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: string,
        @Ctx() { req, em }: MyContext
    ): Promise<boolean> {
        const post = await em.findOne(Post, { id });
        if(req.session.userId !== post.author) throw new ApolloError(
            "You're missing permissions to delete this post.",
            "MISSING_PERMISSIONS"
        ) 
        await em.nativeDelete(Post, { id });
        return true;
    }
}