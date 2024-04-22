import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';

import styles from './Post.module.css'

//chat gpt baybie 
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();


  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const hour = date.getHours() % 12 || 12; // Convert 0 to 12
  const minute = date.getMinutes();
  const period = date.getHours() >= 12 ? 'pm' : 'am';

  if (date.toDateString() === today.toDateString()) {
    return `Today @ ${hour}:${minute.toString().padStart(2, '0')}${period}`;
  }

  
  return `${month} ${day} @ ${hour}:${minute.toString().padStart(2, '0')}${period}`;
}


export function Post({post}: any) {
  return (
    <div className={styles.postContainer}>
      <div className={styles.headerContainer}>
        <Avatar aria-label="profile pic" />
        <p className={styles.username}>{post.member.name}</p>
        <p className={styles.date}>{formatDateTime(post.posted)}</p>
      </div>
      <div className={styles.content}>
        {post.image && <img src={post.image} alt="Post Image" style={{ maxWidth: '100%' }} />}
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
