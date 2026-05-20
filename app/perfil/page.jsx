"use client";

import { useEffect, useState } from "react";
import Parse from "../../lib/parse";
import Link from "next/link";
import { Header } from "../components/Header";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MinhaConta() {
  const [usuario, setUsuario] = useState(undefined);

  const router = useRouter();

  useEffect(() => {
    async function verificarUsuario() {
      try {
        const currentUser = await Parse.User.currentAsync();

        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUsuario(currentUser);
      } catch (error) {
        console.error(error);

        await Parse.User.logOut();

        router.push("/login");
      }
    }

    verificarUsuario();
  }, [router]);

  async function handleLogout() {
    try {
      await Parse.User.logOut();

      localStorage.clear();

      router.push("/login");
    } catch (error) {
      console.error(error);

      localStorage.clear();

      router.push("/login");
    }
  }

  if (usuario === undefined) {
    return (
      <div className="bg-[#efede1] min-h-screen flex items-center justify-center text-[#213131] tracking-[3px] uppercase text-sm">
        Carregando...
      </div>
    );
  }

  return (
    <div className="bg-[#efede1] min-h-screen font-poppins text-[#213131]">
      <Header usuario={usuario} />

      <main className="pt-[140px] px-6 pb-20 max-w-[1300px] mx-auto">
        <section className="mb-16">
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-8
              border
              border-[#213131]/10
              bg-white/40
              p-10
              rounded-[30px]
            "
          >
            <div className="flex items-center gap-6">
              <div
                className="
                  w-24
                  h-24
                  rounded-full
                  bg-[#213131]
                  flex
                  items-center
                  justify-center
                  text-[#efede1]
                  text-3xl
                  font-semibold
                  uppercase
                "
              >
                {usuario.get("nomeCompleto")?.charAt(0)}
              </div>

              <div>
                <p className="uppercase tracking-[4px] text-[0.7rem] opacity-60 mb-2">
                  Minha Conta
                </p>

                <h1 className="text-4xl font-light mb-3">
                  {usuario.get("nomeCompleto")}
                </h1>

                <p className="opacity-70 text-sm">{usuario.get("email")}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="
                flex
                items-center
                justify-center
                gap-2
                border
                border-[#213131]
                px-6
                py-4
                uppercase
                tracking-[3px]
                text-[0.7rem]
                hover:bg-[#213131]
                hover:text-[#efede1]
                transition-all
              "
            >
              <LogOut size={16} />
              Sair da Conta
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
          <div className="bg-white/50 border border-[#213131]/10 rounded-[30px] p-10">
            <div className="flex items-center gap-3 mb-10">
              <User size={22} />

              <h2 className="uppercase tracking-[4px] text-sm">
                Informações da Conta
              </h2>
            </div>

            <div className="space-y-8">
              <div>
                <p className="uppercase tracking-[3px] text-[0.65rem] opacity-60 mb-3">
                  Nome Completo
                </p>

                <div className="border border-[#213131]/15 px-5 py-4 bg-[#efede1]/50">
                  {usuario.get("nomeCompleto")}
                </div>
              </div>

              <div>
                <p className="uppercase tracking-[3px] text-[0.65rem] opacity-60 mb-3">
                  E-mail
                </p>

                <div className="border border-[#213131]/15 px-5 py-4 bg-[#efede1]/50">
                  {usuario.get("email")}
                </div>
              </div>

              <div>
                <p className="uppercase tracking-[3px] text-[0.65rem] opacity-60 mb-3">
                  ID da Conta
                </p>

                <div className="border border-[#213131]/15 px-5 py-4 bg-[#efede1]/50 break-all">
                  {usuario.id}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="bg-white/50 border border-[#213131]/10 rounded-[30px] p-10">
              <div className="flex items-center justify-between mb-8">
                <ShoppingBag size={24} />

                <span className="text-[0.7rem] tracking-[3px] uppercase opacity-60">
                  Carrinho
                </span>
              </div>

              <h2 className="text-5xl font-light mb-3">0</h2>

              <p className="opacity-70 text-sm mb-8">
                Produtos adicionados ao carrinho.
              </p>

              <Link
                href="/produtos"
                className="
                  inline-block
                  border
                  border-[#213131]
                  px-6
                  py-4
                  uppercase
                  tracking-[3px]
                  text-[0.7rem]
                  hover:bg-[#213131]
                  hover:text-[#efede1]
                  transition-all
                "
              >
                Continuar Comprando
              </Link>
              {
                usuario.get("adm") === true && (
                  <Link
                    href="/CRUD_ADM"
                    className="
                      inline-block
                      border
                      border-[#213131]
                      px-6
                      py-4
                      uppercase
                      tracking-[3px]
                      text-[0.7rem]
                      hover:bg-[#213131]
                      hover:text-[#efede1]
                      transition-all
                      mt-4
                    "
                  >
                    Painel Administrativo
                  </Link>
                )
              }
            </div>

            <div
              className="
                bg-[#213131]
                text-[#efede1]
                rounded-[30px]
                p-10
              "
            >
              <p className="uppercase tracking-[4px] text-[0.7rem] opacity-70 mb-5">
                MOM Ateliê
              </p>

              <h2 className="text-3xl font-light leading-tight mb-5">
                Obrigada por fazer parte da nossa história.
              </h2>

              <p className="opacity-80 leading-8 text-sm">
                Cada peça é criada artesanalmente com carinho, delicadeza e
                exclusividade.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
