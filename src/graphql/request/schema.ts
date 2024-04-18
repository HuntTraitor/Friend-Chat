import {Field, ObjectType, InputType} from "type-graphql"
import { Member } from "../member/schema";

@ObjectType()
@InputType("Requests")
export class Requests {
  @Field(() => [Member])
    inbound!: Member[];
  @Field(() => [Member])
    outbound!: Member[];
}

