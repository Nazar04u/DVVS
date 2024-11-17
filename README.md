To get started, you need to clone the repository to your local machine. You can do this by running the following command:

```bash
git clone https://github.com/Nazar04u/DVVS.git
cd app

Then you need to install all dependencies.
Run npm install

Then you should create your Postgresql database locally with one table.
You can copy next command
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(100) NOT NULL
);
After you should create .env file and define your credentials. The next is as example
USER=postgres(default user)
HOST=localhost(default value)
NAME=your_DB_Name
PASSWORD=your password
PORT=5432(default port)

After you did that you should be able to run
npm start.
Now you can create, edit and delete posts
