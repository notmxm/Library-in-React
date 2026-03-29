import { createBrowserRouter, Navigate} from 'react-router-dom';
import { BooksListPage } from '../pages/books/BooksListPage';
import { Layout } from '../components/layout/Layout';
import { NotFoundPage } from '../pages/NotFoundPage';


// https://reactrouter.com/start/framework/routing
// https://reactrouter.com/6.30.3/start/concepts#index-routes
// https://reactrouter.com/6.30.3/components/navigate
// https://reactrouter.com/api/components/NavLink

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children : [
      { index: true, element: <Navigate to="/books" replace /> },
      { path: 'books', element: <BooksListPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
  
]);