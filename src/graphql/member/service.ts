import { Member, MemberId, NewMember } from "./schema";
import { GraphQLError } from "graphql";
import {pool} from '../db'

export class MemberService {
  public async getAll(memberId: string|undefined): Promise<Member []> {
    const select = `SELECT id, data->>'name' AS name FROM member
    WHERE data->>'roles' = '["member"]'
    AND id <> $1`
    const query = {
      text: select,
      values: [`${memberId}`]
    }
    const {rows} = await pool.query(query)
    return rows
  }

  public async get(email: string): Promise<Member | undefined> {
    const select = `SELECT id, data #- '{pwhash}' FROM member` +
    ` WHERE data->>'email' = $1`
    
    const query = {
      text: select,
      values: [`${email}`]
    }

    const {rows} = await pool.query(query)
    if (rows[0]) {
      return rows[0]
    } else {
      return undefined
    }
  }

  public async userExists(member: MemberId): Promise<boolean> {
    const select = `SELECT EXISTS(SELECT true FROM member WHERE id = $1)`
    const query = {
      text: select,
      values: [`${member.memberId}`]
    }
    const {rows} = await pool.query(query)
    return rows[0].exists
  }

  public async create(member: NewMember): Promise<{id: string, name: string}> {
    if (await this.get(member.email)) {
      throw new GraphQLError("Member with supplied email exists")
    }

    const insert = `INSERT INTO member(id, data)` +
    ` VALUES (gen_random_uuid(),` +
    ` jsonb_build_object('email', $1::text, 'name', $2::text, 'pwhash',` +
    ` crypt($3, 'cs'), 'roles', '["member"]'))` + 
    ` RETURNING id, data->>'name' AS name`

    const query = {
      text: insert,
      values: [`${member.email}`, `${member.name}`, `${member.password}`] 
    }
    const {rows} = await pool.query(query)
    return rows[0]
  }
}