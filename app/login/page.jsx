"use client";

import { useState } from "react";
import Parse from "../../lib/parse";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormInput } from "../components/FormInput";
import { z } from "zod";
import { toast } from "react-toastify";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  senha: z
    .string()
    .min(1, "A senha é obrigatória"),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const resultado = loginSchema.safeParse({
      email,
      senha,
    });

    if (!resultado.success) {
      resultado.error.issues.forEach((erro) => {
        toast.error(erro.message);
      });
      return;
    }

    setCarregando(true);

    try {
      await Parse.User.logIn(email, senha);
      toast.success("Login realizado com sucesso!");
      router.push("/");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main
      className="
        bg-[#efede1]
        min-h-screen
        flex
        justify-center
        items-start
        pt-[12vh]
        relative
      "
    >
      <Link
        href="/"
        className="
          absolute
          top-[30px]
          left-[40px]
          no-underline
          text-[#213131]
          text-[0.7rem]
          tracking-[2px]
          font-bold
          opacity-50
          font-['Poppins']
        "
      >
        ← VOLTAR PARA O INÍCIO
      </Link>

      <div className="w-full max-w-[360px] text-center">
        <img
          src="/sublogo.png"
          alt="MOM"
          className="w-[220px] h-auto block mx-auto mb-[10px]"
        />

        <h2 className="font-['Poppins'] text-[#d6988e] tracking-[4px] text-[0.8rem] mb-[35px] font-light">
          BEM-VINDA(O) DE VOLTA
        </h2>

        <form onSubmit={handleLogin} className="w-full text-left">
          <FormInput
            label="E-MAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
          />
          <FormInput
            label="SENHA"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
          />
          <button
            type="submit"
            disabled={carregando}
            className="w-full py-4 bg-[#213131] text-[#efede1] border-none cursor-pointer font-['Poppins'] text-[0.75rem] tracking-[2px] font-bold"
          >
            {carregando ? "ENTRANDO..." : "ACESSAR CONTA"}
          </button>
        </form>

        <Link
          href="/cadastro"
          className="mt-[30px] block text-[#213131] text-[0.75rem] no-underline font-['Poppins']"
        >
          Ainda não tem acesso? <strong>Cadastre-se</strong>
        </Link>
      </div>
    </main>
  );
}
