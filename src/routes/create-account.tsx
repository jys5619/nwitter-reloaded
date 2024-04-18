import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components";
import GithubButton from "../components/github-btn";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      if (isLoading || !name || !email || !password) return;
      setLoading(true);
      // create an account
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      console.log(credentials.user);
      // set the name of the user
      await updateProfile(credentials.user, {
        displayName: name,
      });
      // redirect Home page
      navigate("/");
    } catch (e) {
      // set error
      if (e instanceof FirebaseError) {
        console.log(e.code, e.message);
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Join X</Title>
      <Form onSubmit={onSubmit}>
        <Input
          name="name"
          onChange={onChange}
          value={name}
          placeholder="Name"
          type="text"
          required
        />
        <Input
          name="email"
          onChange={onChange}
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          name="password"
          onChange={onChange}
          value={password}
          placeholder="Password"
          type="password"
          required
        />
        <Input type="submit" value={isLoading ? "Loading..." : "Create Accout"} />
      </Form>
      {error && <Error>{error}</Error>}
      <Switcher>
        Already have an account? <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
