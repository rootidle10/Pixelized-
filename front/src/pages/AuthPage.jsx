import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [message, setMessage] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL; 

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage(null);
    reset();
  };

  // Logique de Connexion - CORRIGÉE
  const handleLogin = async (data) => {
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ CORRECTION: Passer aussi le token !
        login(result.user, result.token);
        navigate("/"); 
      } else {
        setMessage({ type: "error", text: result.message || "Identifiants incorrects." });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({ type: "error", text: "Erreur serveur lors de la connexion." });
    }
  };

  // Logique d'Inscription - CORRIGÉE
  const handleRegister = async (data) => {
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          password_confirmation: data.password, 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'inscription");
      }

      const result = await response.json();
      console.log("Inscription réussie:", result);
      
      // ✅ OPTION 1: Connecter directement l'utilisateur après inscription
      login(result.user, result.token);
      navigate("/profile");
      
      // ✅ OPTION 2: Ou demander à l'utilisateur de se connecter
      // setMessage({ type: "success", text: "Compte créé ! Connectez-vous." });
      // setIsLoginMode(true); 
      // reset();

    } catch (error) {
      console.error("Erreur:", error);
      setMessage({ type: "error", text: "Erreur lors de l'inscription. Vérifiez vos données." });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow"></div>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLoginMode ? "Bon retour" : "Créer un compte"}</h2>
          <p>{isLoginMode ? "Connectez-vous pour accéder à vos jeux." : "Rejoignez la communauté Pixelized."}</p>
        </div>

        <form onSubmit={handleSubmit(isLoginMode ? handleLogin : handleRegister)} className="auth-form">
          
          {!isLoginMode && (
            <div className="input-group">
              <label>Nom d'utilisateur</label>
              <input 
                {...register("name", { required: !isLoginMode })} 
                className="input-field" 
                placeholder="Votre pseudo"
              />
              {errors.name && <span className="error-msg">Ce champ est requis</span>}
            </div>
          )}

          <div className="input-group">
            <label>Adresse Email</label>
            <input 
              {...register("email", { required: true })} 
              className="input-field" 
              placeholder="exemple@email.com"
              type="email"
            />
            {errors.email && <span className="error-msg">Email invalide</span>}
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input
              {...register("password", { required: true, minLength: 6 })}
              className="input-field"
              placeholder="••••••••"
              type="password"
            />
            {errors.password && <span className="error-msg">Min. 6 caractères requis</span>}
          </div>

          <button type="submit" className="btn-submit">
            {isLoginMode ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        {message && (
          <div className={`status-message ${message.type === "success" ? "status-success" : "status-error"}`}>
            {message.text}
          </div>
        )}

        <div className="auth-switch">
          {isLoginMode ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button type="button" onClick={toggleMode} className="btn-switch">
            {isLoginMode ? "S'inscrire" : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}