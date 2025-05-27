import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes';
import notFound from '@middlewares/notFoundHandler';
import errorHandler from '@middlewares/errorHandler';
import swagger from './config/swagger';

// import fileUpload from "express-fileupload";


require('dotenv').config();

const app = express();

// app.use(
//     fileUpload({
//       createParentPath: true
//     })
// )

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }
  


app.use('', router);

swagger(app);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(notFound);
app.use(errorHandler);

export default app;


// RED & GREEN TDD
// import express from 'express';
// // import cors from 'cors';

// const app = express();

// app.use(express.json());
// app.use(cors());

// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// export default app;