import { Requests} from "./schema";
import { Member, MemberId } from "../member/schema";
import {pool} from '../db'

export class RequestService {
  public async create(memberId: string|undefined, requested: MemberId): Promise<Member | undefined> {
    const insert = `INSERT INTO member_friend (member_id, friend_id, accepted)
    SELECT $1, $2, false
    WHERE EXISTS(SELECT 1 FROM member WHERE id = $2)
    RETURNING $2 AS id, 
              (SELECT data->>'name' FROM member WHERE id = $2) AS name,
              false AS accepted;`
    const query = {
      text: insert,
      values: [`${memberId}`, `${requested.memberId}`]
    }

    const {rows} = await pool.query(query)
    return rows[0]
  }

  //I dont like this - change it to seinding two seperate queries and combine that in the complex type
  public async get(id: string|undefined): Promise<Requests> {
    const complexReturn: Requests = {
      inbound: [],
      outbound: []
    };

    const outboundSelect = `SELECT friend_id AS id, data->>'name' AS name
    FROM member_friend
    LEFT OUTER JOIN member ON friend_id = member.id
    WHERE member_id = $1
    AND accepted = false`

    const outboundQuery = {
      text: outboundSelect,
      values: [`${id}`]
    }

    const outbound = await pool.query(outboundQuery)
    complexReturn.outbound = outbound.rows

    const inboundSelect = `SELECT member_id AS id, data->>'name' AS name
    FROM member_friend
    LEFT OUTER JOIN member ON member_id = member.id
    WHERE friend_id = $1
    AND accepted = false`

    const inboundQuery = {
      text: inboundSelect,
      values: [`${id}`]
    }
    const inbound = await pool.query(inboundQuery)
    complexReturn.inbound = inbound.rows
    return complexReturn
  }

  public async put(memberId: string|undefined, requested: MemberId): Promise<Member> {
    const update = `UPDATE member_friend
    SET accepted = true
    WHERE member_id = $2
    AND friend_id = $1
    RETURNING member_id AS id,
    (SELECT data->>'name' FROM member WHERE id = member_id) AS name`

    const query = {
      text: update,
      values: [`${memberId}`, `${requested.memberId}`]
    }
    const {rows} = await pool.query(query)
    return rows[0]
  }

  public async isRequested(memberId: string|undefined, requested: MemberId): Promise<boolean> {
    const select = `SELECT * from member_friend WHERE member_id = $1 AND friend_id = $2 AND accepted = false`
    const query = {
      text: select,
      values: [`${memberId}`, `${requested.memberId}`]
    }
    const {rows} = await pool.query(query)
    if (rows[0]) {
      return true
    }
    return false
  }

  public async isAcceptable(memberId: string|undefined, requested: MemberId): Promise<boolean> {
    const select = `SELECT * from member_friend WHERE member_id = $2 AND friend_id = $1 AND accepted = false`
    const query = {
      text: select,
      values: [`${memberId}`, `${requested.memberId}`]
    }
    const {rows} = await pool.query(query)
    if (rows[0]) {
      return true
    }
    return false
  }
}