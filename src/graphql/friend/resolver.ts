import {Query, Resolver, Mutation, Arg, Authorized, Ctx} from "type-graphql"
import type { NextApiRequest as Request } from "next"

import { Member, MemberId } from "../member/schema"
import { FriendService } from "./service"
import { MemberService } from "../member/service"
import { GraphQLError } from "graphql"

@Resolver()
export class FriendResolver {
  @Authorized("member")
  @Mutation(() => Member)
  async removeFriend(
    @Arg("input") input:  MemberId,
    @Ctx() request: Request
  ): Promise<Member> {
    if (!await new MemberService().userExists(input)) {
      throw new GraphQLError("Member does not exist")
    }

    if (!await new FriendService().areFriends(request.user?.id, input)) {
      throw new GraphQLError("Member is not a Friend")
    }

    return new FriendService().delete(request.user?.id, input)
  }

  @Authorized("member")
  @Query(() => [Member])
  async friend(
    @Ctx() request: Request
  ): Promise<Member[]> {
    return new FriendService().getAll(request.user?.id)
  }
}