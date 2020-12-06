import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entites";
import { MyContext } from "../types";
import uuid from "short-uuid";
import argon2 from "argon2";
import UsernamePasswordInput from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import * as consts from "../constants";
import { isAuthed } from "../middleware/isAuthed";
import { isStaff } from "../middleware/isStaff";

@ObjectType()
class FieldError {
  @Field() field!: string;
  @Field() message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true }) errors?: FieldError[];
  @Field(() => User, { nullable: true }) user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Query(() => UserResponse)
  async user(
    @Arg("username") username: string,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse | null> {
    const user = await em.findOne(User, { username });
    if (!user)
      return {
        errors: [
          {
            field: "user",
            message: "This user cannot be found",
          },
        ],
      };
    if (user.email) return null;
    return { user };
  }

  @UseMiddleware(isAuthed)
  @Mutation(() => UserResponse)
  async followUser(
    @Ctx() { req, em }: MyContext,
    @Arg("id") id: string
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { id });
    const self = await em.findOne(User, { id: req.session.userId });

    if (!user)
      return {
        errors: [
          {
            field: "user",
            message: "This user cannot be found.",
          },
        ],
      };

    if (req.session.userId === user.id)
      return {
        errors: [
          {
            field: "user",
            message: "You cannot follow yourself.",
          },
        ],
      };

    if (user.following.includes(req.session.userId))
      return {
        errors: [
          {
            field: "user",
            message: "You are already following that user.",
          },
        ],
      };

    user.following.push(req.session.userId);

    await em.persistAndFlush(user);

    return { user };
  }

  @UseMiddleware(isAuthed)
  @Mutation(() => UserResponse)
  async unfollowUser(
    @Ctx() { req, em }: MyContext,
    @Arg("id") id: string
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { id });

    if (!user)
      return {
        errors: [
          {
            field: "user",
            message: "This user cannot be found.",
          },
        ],
      };

    if (req.session.userId === user.id)
      return {
        errors: [
          {
            field: "user",
            message:
              "You cannot follow or unfollow yourself, don't be silly! 🐒🍌",
          },
        ],
      };

    // @ts-ignore
    user.following.pop(req.session.userId);

    em.persistAndFlush(user);

    return { user };
  }

  @UseMiddleware(isAuthed)
  @Mutation(() => UserResponse)
  async updateAccount(
    @Ctx() { req, em }: MyContext,
    @Arg("username", { nullable: true }) username?: string,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("email", { nullable: true }) email?: string,
    @Arg("location", { nullable: true }) location?: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("avatar", { nullable: true }) avatar?: string,
    @Arg("private", { nullable: true }) isPrivate?: boolean
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { id: req.session.userId });
    const taken = await em.findOne(User, username ? { username } : { email });

    if (taken && username) {
      return {
        errors: [
          {
            field: "username",
            message: "Sorry, that username is already in use.",
          },
        ],
      };
    }

    if (taken && email) {
      return {
        errors: [
          {
            field: "email",
            message: "Sorry, that email is already in use.",
          },
        ],
      };
    }

    if (username) {
      user.username = username;
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    if (location) {
      user.location = location;
    }

    if (isPrivate) {
      user.private = isPrivate;
    }

    if (description) {
      user.description = description;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await em.persistAndFlush(user);
    return { user };
  }

  @UseMiddleware(isStaff)
  @Mutation(() => UserResponse)
  async updateUser(
    @Ctx() { req, em }: MyContext,
    @Arg("username", { nullable: true }) username?: string,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("email", { nullable: true }) email?: string,
    @Arg("location", { nullable: true }) location?: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("avatar", { nullable: true }) avatar?: string,
    @Arg("private", { nullable: true }) isPrivate?: boolean,
    @Arg("verified", { nullable: true }) verified?: boolean
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username });

    if (name) {
      user.name = name;
    }

    if (location) {
      user.location = location;
    }

    if (isPrivate) {
      user.private = isPrivate;
    }

    if (description) {
      user.description = description;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    if (verified) {
      user.verified = verified;
    }

    await em.persistAndFlush(user);
    return { user };
  }

  @UseMiddleware(isAuthed)
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email: email });
    if (!user) {
      return true;
    }

    const token = uuid.generate();
    await redis.set(
      `forget-password:${token}`,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 1
    );

    console.log(`http://localhost:4000/change-password/${token}`);

    return true;
  }

  // @Mutation(() => UserResponse)
  // async updatePassword(
  //     @Arg("password") password: string,

  // )

  @Mutation(() => UserResponse)
  @Query(() => String)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashed = await argon2.hash(options.password);
    const user = em.create(User, {
      id: uuid.generate(),
      email: options.email,
      username: options.username,
      password: hashed,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "Sorry, that username is already in use.",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // @ts-ignore
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { "lower(email)": usernameOrEmail.toLowerCase() }
        : { "lower(username)": usernameOrEmail.toLowerCase() }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message:
              "Sorry, that username or email couldn't be found. Try again with a different username or email.",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: consts.INVALID_PASSWORD,
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @UseMiddleware(isAuthed)
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(consts.COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
