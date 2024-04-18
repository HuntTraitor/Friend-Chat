import { Member, MemberId} from "../member/schema";
import {pool} from '../db'

export class FriendService {

  public async getAll(memberId: string|undefined): Promise<Member[]> {
    const select = `SELECT friend_id AS id, (SELECT data->>'name' FROM member WHERE id = friend_id) AS name FROM member_friend
    WHERE member_id = $1
    AND accepted = true
    UNION
    SELECT member_id AS id, (SELECT data->>'name' FROM member WHERE id = member_id) AS name FROM member_friend
    WHERE friend_id = $1
    AND accepted = true`

    const query = {
      text: select,
      values: [`${memberId}`]
    }
    const {rows} = await pool.query(query)
    return rows
  }


  public async delete(memberId: string|undefined, requested: MemberId): Promise<Member> {
    const deleteQuery = `DELETE FROM member_friend
    WHERE (member_id = $1
      AND friend_id = $2
      AND accepted = true)
    OR (friend_id = $1
      AND member_id = $2
      AND accepted = true)

    RETURNING $2 AS id,
    (SELECT data->>'name' FROM member 
    WHERE id = $2) AS name`

    const query = {
      text: deleteQuery,
      values: [`${memberId}`, `${requested.memberId}`]
    }

    const {rows} = await pool.query(query)
    return rows[0]
  }

  public async areFriends(memberId: string|undefined, requested: MemberId): Promise<boolean> {
    const select = `SELECT EXISTS(SELECT true FROM member_friend 
      WHERE (member_id = $1 AND friend_id = $2 AND accepted = true)
      OR (friend_id = $1 AND member_id = $2 AND accepted = true))`
  
    const query = {
      text: select,
      values: [`${memberId}`, `${requested.memberId}`]
    }
    const {rows} = await pool.query(query)
    return rows[0].exists
  }
}