import { useForm } from "react-hook-form";

export default function Formulaire() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {

    fetch("http://127.0.0.1:8000/api/register", {
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
    })
      .then(async (response) => {
        console.log("Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur API: ${response.status} - ${errorText}`);
        }

        return response.json();
      })
      .then((data) => {
        console.log("Forum ajouté avec succès:", data);
      })
      .catch((error) => {
        console.error("Erreur:", error);
        alert(error.message);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Register</h2>

      <input {...register("name", { required: true })} placeholder="Name" />
      {errors.name && <p>Name is required</p>}

      <input {...register("email", { required: true })} placeholder="Email" />
      {errors.email && <p>Email is required</p>}

      <input
        {...register("password", { required: true })}
        placeholder="Password"
        type="password"
      />
      {errors.password && <p>Password is required</p>}

      <input type="submit" />
    </form>
  );
}
