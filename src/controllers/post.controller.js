const dx = require('../services/dashx.service')
const executeQuery = require('../services/db.service')

const createPost = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    const {
      rows: [post]
    } = await executeQuery(
      'INSERT INTO posts (user_id, text) VALUES ($1, $2) RETURNING *',
      [req.user.id, req.body.text]
    )

    dx.track('Post Created', req.user.id, post)
    return res.status(200).json({ message: 'Successfully created post.', post })
  } catch (error) {
    if (error.code === '23502') {
      return res.status(422).json({ message: `Missing field ${error.column}.` })
    }

    return res.status(500).json({ message: error })
  }
}

const getPosts = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    const { rows } = await executeQuery(
      `SELECT posts.*, first_name, last_name, email, bookmarked_at FROM posts
      INNER JOIN users ON posts.user_id = users.id
      LEFT JOIN bookmarks ON bookmarks.post_id = posts.id and bookmarks.user_id = $1
      ORDER BY posts.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, req.query.limit, req.query.offset]
    )

    rows.forEach((post) => {
      post.user = {
        id: post.user_id,
        first_name: post.first_name,
        last_name: post.last_name,
        email: post.email
      }
      delete post.first_name
      delete post.last_name
      delete post.email
    })

    return res.status(200).json({ posts: rows })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error })
  }
}

const toggleBookmark = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    const {
      rows: [bookmark]
    } = await executeQuery(
      `INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT (user_id, post_id)
      DO UPDATE SET bookmarked_at = (CASE WHEN bookmarks.bookmarked_at IS NULL THEN NOW() ELSE NULL END)
      RETURNING *;`,
      [req.user.id, req.params.post_id]
    )

    if (bookmark.bookmarked_at) {
      dx.track('Post Bookmarked', req.user.id, bookmark)
    } else {
      dx.track('Post Unbookmarked', req.user.id, bookmark)
    }

    return res.status(204).json()
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ message: `Post not found.` })
    }
    console.log(error)
    return res.status(500).json({ message: error })
  }
}

const getBookmarkedPosts = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    const { rows } = await executeQuery(
      `SELECT posts.*, first_name, last_name, email, bookmarked_at FROM posts
      INNER JOIN users ON posts.user_id = users.id
      INNER JOIN bookmarks ON posts.id = bookmarks.post_id
      where bookmarks.user_id = $1 AND bookmarks.bookmarked_at IS NOT NULL
      ORDER BY posts.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, req.query.limit, req.query.offset]
    )

    rows.forEach((post) => {
      post.user = {
        id: post.user_id,
        first_name: post.first_name,
        last_name: post.last_name,
        email: post.email
      }
      delete post.first_name
      delete post.last_name
      delete post.email
    })

    return res
      .status(200)
      .json({ message: 'Successfully fetched.', posts: rows })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

module.exports = { createPost, getPosts, toggleBookmark, getBookmarkedPosts }
