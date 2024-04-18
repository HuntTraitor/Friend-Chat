import {Field, ObjectType, ArgsType} from "type-graphql"
import {Matches} from "class-validator"

@ArgsType()
export class Credentials {
  @Field()
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    email!: string
  @Field()
  // @Length(8, 16)
    password!: string
}

@ObjectType()
export class Authenticated {
  @Field()
    name!: string
  @Field()
    accessToken!: string
}