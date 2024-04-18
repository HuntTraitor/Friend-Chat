import {Field, ObjectType, InputType, ArgsType, Int, ID, GraphQLISODateTime} from "type-graphql"
import {IsNotEmpty, IsInt, Min} from "class-validator"

@ObjectType()
@InputType("PostInput")
export class Post {
  @Field(() => ID)
    id!: string
  @Field(() => GraphQLISODateTime)
    posted!: string
  @Field()
    content!: string
  @Field({nullable: true})
    image?: string
}

@ObjectType()
@InputType("NewPost")
export class NewPost {
  @Field()
  @IsNotEmpty()
    content!: string
  @Field({nullable: true})
  @IsNotEmpty()
    image?: string
}

@ArgsType()
export class PostArgs {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
    page!: number
  @Field(() => Int, {nullable: true})
  @IsNotEmpty()
  @IsInt()
  @Min(1)
    size?: number
}