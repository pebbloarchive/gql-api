import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entites/Post";
import { MyContext } from "../types";
import uuid from 'short-uuid';
import { ratelimit } from "../middleware/ratelimit";
import { FileUpload, GraphQLUpload } from "graphql-upload"
import { isAuthed } from "../middleware/isAuthed";
import session from "express-session";
import { ApolloError } from "apollo-server-express";

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
    @Mutation(() => Post)
    async createPost(
        @Arg('content') content: string,
        @Ctx() { em, req }: MyContext
    ): Promise<Post> {
        const post = em.create(Post, { content, id: uuid.generate(), author: req.session.userId, type: 'post' });
        await em.persistAndFlush(post);
        return post;
    }

    @UseMiddleware(isAuthed)
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: string,
        @Arg("content", () => String, { nullable: true }) content: string,
        @Ctx() { req, em }: MyContext
    ): Promise<Post | null> {
        const post = await em.findOne(Post, { id });
        if(req.session.userId !== post.author) throw new ApolloError(
            "You're missing permissions to update this post.",
            "MISSING_PERMISSIONS"
        ) 
        if(post) return null;
        if(typeof post !== 'undefined') {
            post.content = content;
            await em.persistAndFlush(post);
        }
        return post;
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