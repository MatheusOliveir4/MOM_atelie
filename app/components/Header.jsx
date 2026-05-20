"use client";

import { useEffect, useState } from "react";

import Parse from "../../lib/parse";

import Link from "next/link";

export function Header() {
  const [usuario, setUsuario] =
    useState(undefined);

  const [quantidadeCarrinho, setQuantidadeCarrinho] =
    useState(0);

  useEffect(() => {
    async function carregarDados() {
      try {
        const currentUser =
          await Parse.User.currentAsync();

        setUsuario(currentUser);

        if (!currentUser) return;

        /*
          =========================
          BUSCA CARRINHO
          =========================
        */

        const Carrinho =
          Parse.Object.extend("Carrinho");

        const carrinhoQuery =
          new Parse.Query(Carrinho);

        carrinhoQuery.equalTo(
          "usuario",
          currentUser
        );

        const carrinho =
          await carrinhoQuery.first();

        if (!carrinho) return;

        /*
          =========================
          BUSCA ITENS
          =========================
        */

        const CarrinhoItem =
          Parse.Object.extend(
            "CarrinhoItem"
          );

        const itemQuery =
          new Parse.Query(CarrinhoItem);

        itemQuery.equalTo(
          "carrinho",
          carrinho
        );

        const itens =
          await itemQuery.find();

        /*
          =========================
          SOMA QUANTIDADES
          =========================
        */

        const total =
          itens.reduce((acc, item) => {
            return (
              acc +
              (item.get("quantidade") ?? 0)
            );
          }, 0);

        setQuantidadeCarrinho(total);
      } catch (error) {
        console.error(error);
      }
    }

    carregarDados();
  }, []);

  return (
    <header
      className="
        w-full
        flex
        flex-col
        lg:flex-row
        items-center
        justify-between
        gap-6
        px-5
        lg:px-10
        py-5
        bg-[#efede1]
      "
    >
      {/* ESQUERDA */}
      <div
        className="
          w-full
          lg:flex-1
          flex
          justify-center
          lg:justify-start
          order-2
          lg:order-1
        "
      >
        <nav
          className="
            flex
            items-center
            gap-5
            sm:gap-[30px]
            flex-wrap
            justify-center
          "
        >
          <Link
            href="/sobre"
            className="
              border
              border-[#213131]
              px-4
              py-2
              text-[#213131]
              text-[0.7rem]
              sm:text-[0.75rem]
              tracking-[2px]
              font-semibold
              no-underline
              transition-all
              hover:bg-[#213131]
              hover:text-[#efede1]
              font-poppins
              uppercase
            "
          >
            Sobre Mim
          </Link>
        </nav>
      </div>

      {/* LOGO */}
      <div
        className="
          flex
          justify-center
          order-1
          lg:order-2
        "
      >
        <Link href="/">
          <img
            src="/Logo_principal.png"
            alt="MOM Ateliê"
            className="w-[110px] sm:w-[130px] h-auto"
          />
        </Link>
      </div>

      {/* DIREITA */}
      <div
        className="
          w-full
          lg:flex-1
          flex
          flex-col
          sm:flex-row
          justify-center
          lg:justify-end
          gap-5
          items-center
          order-3
        "
      >
        <Link
          href="/carrinho"
          className="
            text-[#213131]
            no-underline
            tracking-[2px]
            text-[0.7rem]
            sm:text-[0.75rem]
            font-medium
            font-poppins
            uppercase
          "
        >
          Carrinho ({quantidadeCarrinho})
        </Link>

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-[15px]
          "
        >
          <Link
            href={
              usuario
                ? "/perfil"
                : "/login"
            }
            className="
              border
              border-[#213131]
              px-4
              py-2
              text-[#213131]
              text-[0.7rem]
              sm:text-[0.75rem]
              tracking-[2px]
              font-semibold
              no-underline
              transition-all
              hover:bg-[#213131]
              hover:text-[#efede1]
              font-poppins
              uppercase
            "
          >
            {usuario
              ? "Perfil"
              : "Entrar"}
          </Link>

          {!usuario && (
            <Link
              href="/cadastro"
              className="
                border
                border-[#213131]
                px-4
                py-2
                text-[#213131]
                text-[0.7rem]
                sm:text-[0.75rem]
                tracking-[2px]
                font-semibold
                no-underline
                transition-all
                hover:bg-[#213131]
                hover:text-[#efede1]
                font-poppins
                uppercase
              "
            >
              Cadastre-se
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}