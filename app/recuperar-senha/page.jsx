"use client";

import { useState } from "react";
import Parse from "@/lib/parse";
import { toast } from "react-toastify";
import Link from "next/link";
import { FormInput } from "../components/FormInput";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleRecuperarSenha(e) {
    e.preventDefault();

    setCarregando(true);

    try {
      await Parse.User.requestPasswordReset(email);

      toast.success(
        "Enviamos um link para redefinição de senha."
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCarregando(false);
    }
  }

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
          RECUPERE SUA SENHA
        </h2>

        <form onSubmit={handleRecuperarSenha} className="w-full text-left">
          <FormInput
            label="E-MAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-4 bg-[#213131] text-[#efede1] border-none cursor-pointer font-['Poppins'] text-[0.75rem] tracking-[2px] font-bold"
          >
            {carregando ? "ENVIANDO..." : "RECUPERAR SENHA"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-[30px] block text-[#213131] text-[0.75rem] no-underline font-['Poppins'] underline"
        >
          Voltar ao login!
        </Link>

      </div>
    </main>
    
  );
}