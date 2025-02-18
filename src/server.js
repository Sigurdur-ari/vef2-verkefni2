import express from 'express';
import { router } from './routes.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const path = dirname(fileURLToPath(import.meta.url));


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(path, '../public')));

const viewsPath = new URL('./views', import.meta.url).pathname;
app.set('views', viewsPath);
app.set('view engine', 'ejs');

app.use('/', router);

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
