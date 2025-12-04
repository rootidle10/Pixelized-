import './App.css';
import Connection from './formulaire/connection.jsx';
import Formulaire from './formulaire/formulaire.jsx';
import { useAuth } from '../src/context/AuthContext.jsx';
import { Link } from "react-router-dom";

function App() {
  const { user, logout } = useAuth();
  console.log(user) ;

  return (
    <>
    <h1>hello</h1>
      <div>
        <Formulaire />
        <Connection />
      </div>
      <div>
        <ul>
          {user && (
            <li>
             connect
            </li>
          )}

          {!user && (
            <li>
              <button className="button">
                pas connect
              </button>
            </li>
          )}
        </ul>
          {user ? (
                      <>
                        <button className='button' onClick={logout}>Déconnexion</button>
                      </>
                    ) : (
                      <button className='button'><Link to="/login">Login</Link></button>
                    )}
      </div>
    </>
  );
}

export default App;
