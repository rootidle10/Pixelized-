import { useForm } from "react-hook-form";
import { useAuth } from '../context/AuthContext';
import { useState } from "react";

export default function Connection() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();      
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        login(result.user);
        setMessage("Connexion réussie !");
      } else {
        setMessage(result.message || "Identifiants incorrects.");
      }

    } catch (error) {
      console.error("Erreur:", error);
      setMessage("Erreur lors de la connexion.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Connection</h2>

      <input {...register("email", { required: true })} placeholder="Email" />
      {errors.email && <p>Email is required</p>}

      <input
        {...register("password", { required: true })}
        placeholder="Password"
        type="password"
      />
      {errors.password && <p>Password is required</p>}

      <input type="submit" value="Se connecter" />

      {message && <p>{message}</p>}
    </form>
  );
}
