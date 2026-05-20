"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Parse from "@/lib/parse";

import Link from "next/link";

export default function ProdutoPage() {
  const { id } = useParams();

  const router = useRouter();

  const [produto, setProduto] = useState(null);

  const [loadingCarrinho, setLoadingCarrinho] =
    useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const Produto =
          Parse.Object.extend("Produtos");

        const query = new Parse.Query(Produto);

        query.equalTo("objectId", id);

        const result = await query.first();

        if (result) {
          setProduto({
            id: result.id,

            parseObject: result,

            nome: result.get("nome"),

            preco: Number(
              result.get("preco") ?? 0
            ),

            descricao:
              result.get("descricao"),

            imagem: result
              .get("imagem")
              ?.url?.(),
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (id) carregar();
  }, [id]);

  /*
    =========================
    ADICIONAR AO CARRINHO
    =========================
  */

  async function adicionarAoCarrinho() {
    try {
      setLoadingCarrinho(true);

      /*
        =========================
        USUÁRIO LOGADO
        =========================
      */

      const currentUser =
        await Parse.User.currentAsync();

      if (!currentUser) {
        router.push("/login");

        return;
      }

      /*
        =========================
        BUSCAR CARRINHO
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

      let carrinho =
        await carrinhoQuery.first();

      /*
        =========================
        CRIAR CARRINHO
        =========================
      */

      if (!carrinho) {
        carrinho = new Carrinho();

        carrinho.set(
          "usuario",
          currentUser
        );

        await carrinho.save();
      }

      /*
        =========================
        BUSCAR ITEM EXISTENTE
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

      itemQuery.equalTo(
        "produto",
        produto.parseObject
      );

      let item =
        await itemQuery.first();

      /*
        =========================
        SE JÁ EXISTE
        =========================
      */

      if (item) {
        const quantidadeAtual =
          item.get("quantidade") ?? 1;

        item.set(
          "quantidade",
          quantidadeAtual + 1
        );

        await item.save();
      }

      /*
        =========================
        SE NÃO EXISTE
        =========================
      */

      else {
        item = new CarrinhoItem();

        item.set(
          "carrinho",
          carrinho
        );

        item.set(
          "produto",
          produto.parseObject
        );

        item.set("quantidade", 1);

        await item.save();
      }

      alert("Produto adicionado ao carrinho!");
    } catch (error) {
      console.error(error);

      alert(
        "Erro ao adicionar produto ao carrinho."
      );
    } finally {
      setLoadingCarrinho(false);
    }
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efede1] text-[#213131] font-poppins">
        Carregando produto...
      </div>
    );
  }

  const precoFormatado =
    produto.preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="min-h-screen bg-[#efede1] text-[#213131] font-poppins">
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <Link
          href="/produtos"
          className="
            text-xs
            uppercase
            tracking-[3px]
            opacity-60
            hover:opacity-100
            transition
          "
        >
          ← Voltar
        </Link>

        <div className="grid md:grid-cols-2 gap-16 mt-10 items-center">
          {/* IMAGEM */}
          <div
            className="
              bg-white/40
              border
              border-[#213131]/10
              rounded-[25px]
              p-6
              flex
              items-center
              justify-center
            "
          >
            <img
              src={produto.imagem}
              alt={produto.nome}
              className="
                w-full
                max-h-[500px]
                object-contain
              "
            />
          </div>

          {/* INFO */}
          <div>
            <h1
              className="
                text-3xl
                md:text-4xl
                uppercase
                tracking-[4px]
                font-light
                mb-6
              "
            >
              {produto.nome}
            </h1>

            <p className="text-[#d6988e] text-2xl mb-8">
              {precoFormatado}
            </p>

            <p
              className="
                leading-8
                opacity-70
                mb-10
                whitespace-pre-line
              "
            >
              {produto.descricao}
            </p>

            <button
              onClick={adicionarAoCarrinho}
              disabled={loadingCarrinho}
              className="
                w-full
                border
                border-[#213131]
                py-4
                uppercase
                tracking-[3px]
                text-[0.75rem]
                hover:bg-[#213131]
                hover:text-[#efede1]
                transition
                disabled:opacity-50
              "
            >
              {loadingCarrinho
                ? "Adicionando..."
                : "Adicionar ao carrinho"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}