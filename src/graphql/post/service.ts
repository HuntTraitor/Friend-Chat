import {Post, NewPost} from "./schema"
import {pool} from '../db'

export class PostService {
  public async create(Post: NewPost, userId: string|undefined): Promise<Post> {
    const insert = `INSERT INTO post(member_id, data) VALUES($1, 
      jsonb_build_object('posted', current_timestamp, 'content', $2::text, 'image', $3::text)) 
      RETURNING id, 
      (SELECT jsonb_build_object('id', member.id, 'name', member.data->>'name')
        FROM member WHERE member.id = $1) AS member,
      data->>'posted' AS posted, 
      data->>'content' AS content,
      data->>'image' AS image`
    const query = {
      text: insert,
      values: [`${userId}`, `${Post.content}`, `${Post.image}`]
    }
    const {rows} = await pool.query(query)
    rows[0].posted = new Date(rows[0].posted)
    return rows[0]
  }

  //adding member part of the query :D
  public async getAll(page: number, size: number|undefined, memberId: string|undefined): Promise<Post[]> {
    if (size === undefined) {
      size = 20
    }

    const offset = (size * page) - size

    const select = `SELECT post.id, 
    jsonb_build_object('id', member.id, 'name', member.data->>'name') AS member,
    post.data->>'posted' AS posted, 
    post.data->>'content' AS content,
    post.data->>'image' AS image
    FROM post LEFT OUTER JOIN member ON member.id = member_id
    WHERE member_id = $1
    OR member_id IN (
      (SELECT member_id 
      FROM member_friend 
      WHERE friend_id = $1
      AND accepted = true)
        UNION 
      (SELECT friend_id 
      FROM member_friend 
      WHERE member_id = $1
      AND accepted = true))
    ORDER BY post.data->>'posted' DESC
    LIMIT $2 OFFSET $3`;

    const query = {
      text: select,
      values: [`${memberId}`, `${size}`, `${offset}`]
    }
    const {rows} = await pool.query(query)

    const posts = rows.map(row => ({
      ...row,
      posted: new Date(row.posted) 
    }));
    return posts
  }
}
