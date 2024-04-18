/*
#######################################################################
#
# Copyright (C) 2022-2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without 
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {Args, Query, Resolver } from "type-graphql"
import { Authenticated, Credentials } from "./schema";
import { AuthService } from "./service";

// Chaneg this to the signature from the example
@Resolver()
export class AuthResolver {
  @Query(() => Authenticated)
  async login(
    @Args() credentials: Credentials
  ): Promise<Authenticated> {
    return new AuthService().login(credentials)
  }
}