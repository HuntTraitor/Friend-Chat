import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';

import styles from './Post.module.css'

export function Post({post}: any) {
  return (
    <div>
      <div className={styles.headerContainer}>
        <Avatar aria-label="profile pic" />
        <p className={styles.username}>{post.member.name}</p>
        <p className={styles.date}>{post.posted}</p>
      </div>
      <div className={styles.content}>
        {post.image && <img src={post.image} alt="Post Image" />}
        <div>
          {post.content}
        </div>
      </div>
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.object.isRequired,
};
