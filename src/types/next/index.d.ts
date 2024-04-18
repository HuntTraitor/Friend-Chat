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
/*
#######################################################################
#                   DO NOT MODIFY THIS FILE
#######################################################################
*/

export type SessionUser = {
  id: string
}

declare module 'next' {
  export interface NextApiRequest {
    user: SessionUser
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: any
  }
}