import { createBrowserRouter} from 'react-router-dom';
import { BooksListPage } from '../pages/BooksListPage';


// https://reactrouter.com/start/framework/routing

export const router = createBrowserRouter([
  {
    path: '/books',
    element: <BooksListPage />,
  }
  
]);