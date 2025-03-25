import react from 'react';
import { Link } from 'react-router-dom';


const Error404 = () => {
  return (
    <div>
      <h1>Error 404</h1>
      <Link to="/">Go back to Home</Link>
    </div>
  );
};

export default Error404;