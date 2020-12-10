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
import * as consts from "../constants";
import { isAuthed } from "../middleware/isAuthed";
import Result from "./types";
