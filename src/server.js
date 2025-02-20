import express from 'express';
import { router } from './routes.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {handle404Error, handleError} from './lib/error-handlers.js'

const path = dirname(fileURLToPath(import.meta.url));


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(path, '../public')));

const viewsPath = new URL('./views', import.meta.url).pathname;
app.set('views', viewsPath);
app.set('view engine', 'ejs');

app.use('/', router);

const hostname = '0.0.0.0';
const port = Number(process.env.PORT) || 3000;

app.use(handle404Error);
app.use(handleError);


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
