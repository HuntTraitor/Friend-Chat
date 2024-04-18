import { Query, Resolver, Mutation, Arg, Authorized, Ctx } from "type-graphql"
import type { NextApiRequest as Request } from "next"

import { Member, NewMember} from "./schema"
import { MemberService } from "./service"

@Resolver()
export class MemberResolver {
  @Authorized("member")
  @Query(() => [Member])
  async member(
    @Ctx() request: Request
  ): Promise<Member[]> {
    return new MemberService().getAll(request.user?.id)
  }

  @Authorized("admin")
  @Mutation(() => Member)
  async makeMember(
    @Arg("input") input: NewMember,
  ): Promise<Member> {
    return new MemberService().create(input)
  }
}

