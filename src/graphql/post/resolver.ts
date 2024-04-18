import {Query, Resolver, Mutation, Args, Arg, Authorized, Ctx} from "type-graphql"
import type { NextApiRequest as Request } from "next"

import {Post, NewPost, PostArgs} from "./schema"
import { PostService } from "./service"

@Resolver()
export class PostResolver {
  @Authorized("member")
  @Mutation(() => Post)
  async makePost(
    @Arg("input") input: NewPost,
    @Ctx() request: Request
  ): Promise<Post> {
    return new PostService().create(input, request.user?.id)
  }

  @Authorized("member")
  @Query(() => [Post])
  async post(
    @Args() {page, size}: PostArgs,
    @Ctx() request: Request
  ): Promise<Post[]> {
    return new PostService().getAll(page, size, request.user?.id)
  }
}
