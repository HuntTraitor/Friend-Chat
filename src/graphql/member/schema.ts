import {Field, ObjectType, InputType, ID} from "type-graphql"
import {Matches, isNotEmpty} from "class-validator"

@ObjectType()
@InputType("MemberInput")
export class Member {
  @Field(() => ID)
  @Matches(/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/)
    id!: string
  @Field()
    name!: string
}

@ObjectType()
@InputType("NewMember")
export class NewMember {
  @Field()
    name!: string
  @Field()
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    email!: string
  @Field()
  // @Length(8, 16)
    password!: string
}

@ObjectType()
@InputType("MemberId")
export class MemberId {
  @Field()
  @Matches(/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/)
    memberId!: string
}