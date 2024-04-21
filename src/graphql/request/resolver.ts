import {Query, Resolver, Mutation, Arg, Authorized, Ctx, Args} from "type-graphql"
import type { NextApiRequest } from "next"

import { Member, MemberId } from "../member/schema"
import {Requests} from "./schema"
import { RequestService } from "./service"
import { FriendService } from "../friend/service"
import { MemberService } from "../member/service"
import { GraphQLError } from "graphql"

@Resolver()
export class RequestResolver {
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => Member)
  async makeRequest(
    @Arg("input") input: MemberId,
    @Ctx() request: NextApiRequest
  ): Promise<Member|undefined> {

    if (!await new MemberService().userExists(input)) {
      throw new GraphQLError("Member does not exist")
    }

    if (input.memberId === request.user?.id) {
      throw new GraphQLError("Member has sent a Request to the logged in Member")
    }

    if (await new FriendService().areFriends(request.user?.id, input)) {
      throw new GraphQLError("Member is already a Friend")
    }

    if (await new RequestService().isRequested(request.user?.id, input)) {
      throw new GraphQLError("A Request to Member has already been made")
    }

    return new RequestService().create(request.user?.id, input)
  }

  @Authorized("member")
  @Mutation(() => Member)
  async acceptRequest(
    @Arg("input") input: MemberId,
    @Ctx() request: NextApiRequest
  ): Promise<Member> {
    if (!await new MemberService().userExists(input)) {
      throw new GraphQLError("Member does not exist")
    }

    if (!await new RequestService().isAcceptable(request.user?.id, input)) {
      throw new GraphQLError("Member did not send a Request")
    }

    return new RequestService().put(request.user?.id, input)
  }

  // @Authorized("member")
  // @Mutation(() => Member)
  // async removeRequest(
  //   @Arg("input") input: MemberId,
  //   @Ctx() request: Request
  // ): Promise<Member> {

  // }

  @Authorized("member")
  @Query(() => Requests)
  async request(
    @Ctx() request: NextApiRequest
  ): Promise<Requests> {
    return new RequestService().get(request.user?.id)
  }

}