import express from 'express';
import bodyParser from 'body-parser';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.NAME,
  password: process.env.PASSWORD,
  port: process.env.PORT
});

// Test the database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Database connection error', err));


// Set up path constants
const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, "views/index.ejs");
const homePath = join(__dirname, "views/home.ejs");
const blogDetailsPath = join(__dirname, "views/blogDetails.ejs");
const editBlogPath = join(__dirname, "views/editBlog.ejs");

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', __dirname);

// Main Route
app.get("/", (req, res) => {
  res.render(indexPath);
});

// Route for displaying all blog posts
app.get("/home", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.render(homePath, { blogList: result.rows });
  } catch (err) {
    console.error('Error fetching posts', err);
    res.status(500).send('Error fetching posts');
  }
});


app.get("/create", (req, res) => {
    res.render("views/createBlog.ejs"); // Adjust path if necessary
  });
  
  // Route for handling blog creation form submission
  app.post("/create", async (req, res) => {
    const { blogTitle, blogDes, blogAut } = req.body;
  
    try {
      await pool.query(
        'INSERT INTO posts (title, description, author) VALUES ($1, $2, $3)',
        [blogTitle, blogDes, blogAut]
      );
      res.redirect("/home");
    } catch (err) {
      console.error('Error inserting post', err);
      res.status(500).send('Error creating posts');
    }
  });
  

// Route for viewing individual blog post
app.get("/blogDetails/:id", async (req, res) => {
  const blogId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [blogId]);
    if (result.rows.length === 0) {
      return res.status(404).send("Post not found");
    }
    res.render(blogDetailsPath, { blogDetails: result.rows[0] });
  } catch (err) {
    console.error('Error fetching posts', err);
    res.status(500).send('Error fetching posts');
  }
});


// Route for editing a blog post
app.get("/edit/:id", async (req, res) => {
  const blogId = req.params.id;

  try {
    // Query the database for the blog post by ID
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [blogId]);
    // If no blog post is found, return a 404 error
    if (result.rows.length === 0) {
      return res.status(404).send("Post not found");
    }

    // Render the editBlog view with the blog details
    res.render(editBlogPath, { blogDetails: result.rows[0] });
  } catch (err) {
    console.error('Error fetching post for editing', err);
    res.status(500).send('Error fetching post for editing');
  }
});


// Route for updating a blog post
app.post("/edit/:id", async (req, res) => {
  const blogId = req.params.id;
  const { blogTitle, blogDes, blogAut } = req.body;
  try {
    await pool.query(
      'UPDATE posts SET title = $1, description = $2, author = $3 WHERE id = $4',
      [blogTitle, blogDes, blogAut, blogId]
    );
    res.redirect('/home');
  } catch (err) {
    console.error('Error updating post', err);
    res.status(500).send('Error updating post');
  }
});


// Route for deleting a blog post
app.post("/delete/:id", async (req, res) => {
  const blogId = req.params.id;

  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [blogId]);
    res.redirect('/home');
  } catch (err) {
    console.error('Error deleting post', err);
    res.status(500).send('Error deleting post');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
