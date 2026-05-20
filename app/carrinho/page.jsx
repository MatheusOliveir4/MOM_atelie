"use client";

import { useEffect, useState } from "react";

import Parse from "../../lib/parse";

import Link from "next/link";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function CarrinhoPage() {
  const [usuario, setUsuario] = useState(undefined);

  const [produtos, setProdutos] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarCarrinho() {
      try {
        const currentUser =
          await Parse.User.currentAsync();

        setUsuario(currentUser);

        if (!currentUser) {
          setLoading(false);
          return;
        }

        /*
          =========================
          BUSCA CARRINHO DO USUÁRIO
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

        if (!carrinho) {
          setProdutos([]);

          setLoading(false);

          return;
        }

        /*
          =========================
          BUSCA ITENS DO CARRINHO
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

        itemQuery.include("produto");

        const results =
          await itemQuery.find();

        const itensFormatados =
          results.map((item) => {
            const produto =
              item.get("produto");

            return {
              id: item.id,

              quantidade:
                item.get("quantidade"),

              nome:
                produto?.get("nome"),

              preco:
                produto?.get("preco"),

              imagem: produto
                ?.get("imagem")
                ?.url(),

              produtoId: produto?.id,
            };
          });

        setProdutos(itensFormatados);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarCarrinho();
  }, []);

  /*
    =========================
    AUMENTAR QUANTIDADE
    =========================
  */

  async function aumentarQuantidade(
    itemId
  ) {
    try {
      const CarrinhoItem =
        Parse.Object.extend(
          "CarrinhoItem"
        );

      const query =
        new Parse.Query(CarrinhoItem);

      const item =
        await query.get(itemId);

      const quantidadeAtual =
        item.get("quantidade");

      item.set(
        "quantidade",
        quantidadeAtual + 1
      );

      await item.save();

      atualizarFrontend(
        itemId,
        quantidadeAtual + 1
      );
    } catch (error) {
      console.error(error);
    }
  }

  /*
    =========================
    DIMINUIR QUANTIDADE
    =========================
  */

  async function diminuirQuantidade(
    itemId
  ) {
    try {
      const CarrinhoItem =
        Parse.Object.extend(
          "CarrinhoItem"
        );

      const query =
        new Parse.Query(CarrinhoItem);

      const item =
        await query.get(itemId);

      const quantidadeAtual =
        item.get("quantidade");

      if (quantidadeAtual <= 1) {
        await item.destroy();

        setProdutos((prev) =>
          prev.filter(
            (p) => p.id !== itemId
          )
        );

        return;
      }

      item.set(
        "quantidade",
        quantidadeAtual - 1
      );

      await item.save();

      atualizarFrontend(
        itemId,
        quantidadeAtual - 1
      );
    } catch (error) {
      console.error(error);
    }
  }

  /*
    =========================
    REMOVER ITEM
    =========================
  */

  async function removerProduto(
    itemId
  ) {
    try {
      const CarrinhoItem =
        Parse.Object.extend(
          "CarrinhoItem"
        );

      const query =
        new Parse.Query(CarrinhoItem);

      const item =
        await query.get(itemId);

      await item.destroy();

      setProdutos((prev) =>
        prev.filter(
          (p) => p.id !== itemId
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  /*
    =========================
    ATUALIZA FRONT
    =========================
  */

  function atualizarFrontend(
    itemId,
    novaQuantidade
  ) {
    setProdutos((prev) =>
      prev.map((produto) =>
        produto.id === itemId
          ? {
              ...produto,
              quantidade:
                novaQuantidade,
            }
          : produto
      )
    );
  }

  /*
    =========================
    FINALIZAR PEDIDO
    =========================
  */

  function finalizarPedido() {
    if (produtos.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    let mensagem =
      "Olá! Gostaria de finalizar meu pedido na MOM Ateliê \n\n";

    produtos.forEach((produto) => {
      const precoUnitario = Number(
        produto.preco ?? 0
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      const totalItem = (
        produto.preco *
        produto.quantidade
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      mensagem +=
        `• ${produto.nome}\n` +
        `Quantidade: ${produto.quantidade}\n` +
        `Preço unidade: ${precoUnitario}\n` +
        `Total item: ${totalItem}\n\n`;
    });

    mensagem +=
      `Total do pedido: ${subtotalFormatado}\n\n`;

    mensagem +=
      "Aguardo informações sobre pagamento e entrega ";

    const telefoneLoja =
      "5581992282553";

    const url =
      `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(
        mensagem
      )}`;

    window.open(url, "_blank");
  }

  /*
    =========================
    SUBTOTAL
    =========================
  */

  const subtotal = produtos.reduce(
    (acc, item) =>
      acc +
      item.preco * item.quantidade,
    0
  );

  const subtotalFormatado =
    subtotal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  /*
    =========================
    LOADING
    =========================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efede1] flex items-center justify-center">
        <p className="text-[#213131] uppercase tracking-[3px] text-sm">
          Carregando carrinho...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efede1] flex flex-col">
      <Header usuario={usuario} />

      <main className="flex-1 px-5 sm:px-10 lg:px-20 py-16">
        <div className="mb-14 text-center">
          <h1
            className="
              text-[1.5rem]
              uppercase
              tracking-[5px]
              text-[#213131]
              mb-4
              font-light
            "
          >
            Seu Carrinho
          </h1>

          <p className="text-[#213131] opacity-70 text-[0.95rem]">
            Revise suas peças antes de finalizar
            o pedido.
          </p>
        </div>

        {produtos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#213131] opacity-70 mb-8">
              Seu carrinho está vazio.
            </p>

            <Link
              href="/produtos"
              className="
                border
                border-[#213131]
                px-8
                py-3
                uppercase
                tracking-[2px]
                text-[0.75rem]
                text-[#213131]
                hover:bg-[#213131]
                hover:text-[#efede1]
                transition-all
              "
            >
              Explorar produtos
            </Link>
          </div>
        ) : (
          <div
            className="
              grid
              lg:grid-cols-[1.5fr_0.7fr]
              gap-14
              items-start
            "
          >
            <div className="flex flex-col gap-8">
              {produtos.map((produto) => {
                const totalItem = (
                  produto.preco *
                  produto.quantidade
                ).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                return (
                  <div
                    key={produto.id}
                    className="
                      border
                      border-[rgba(33,49,49,0.12)]
                      p-5
                      bg-[#f4f1e8]
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-6
                        items-start
                      "
                    >
                      <div className="overflow-hidden bg-[#e5e1d3]">
                        <img
                          src={produto.imagem}
                          alt={produto.nome}
                          className="
                            w-full
                            sm:w-[180px]
                            h-[220px]
                            object-cover
                          "
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <div className="mb-6">
                          <h2
                            className="
                              uppercase
                              tracking-[2px]
                              text-[0.85rem]
                              text-[#213131]
                              mb-2
                            "
                          >
                            {produto.nome}
                          </h2>

                          <p className="text-[#d6988e] text-[0.9rem]">
                            {totalItem}
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-4
                            mb-6
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              border
                              border-[#213131]
                            "
                          >
                            <button
                              onClick={() =>
                                diminuirQuantidade(
                                  produto.id
                                )
                              }
                              className="
                                px-4
                                py-2
                                text-[#213131]
                              "
                            >
                              -
                            </button>

                            <span
                              className="
                                px-4
                                text-[#213131]
                                text-[0.85rem]
                              "
                            >
                              {
                                produto.quantidade
                              }
                            </span>

                            <button
                              onClick={() =>
                                aumentarQuantidade(
                                  produto.id
                                )
                              }
                              className="
                                px-4
                                py-2
                                text-[#213131]
                              "
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              removerProduto(
                                produto.id
                              )
                            }
                            className="
                              text-[0.7rem]
                              uppercase
                              tracking-[2px]
                              text-[#a66]
                              hover:opacity-70
                              transition-all
                            "
                          >
                            Remover
                          </button>
                        </div>

                        <p
                          className="
                            text-[0.75rem]
                            text-[#213131]
                            opacity-60
                            tracking-[1px]
                          "
                        >
                          Produção artesanal • envio
                          em até 7 dias úteis
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside
              className="
                border
                border-[rgba(33,49,49,0.12)]
                bg-[#f4f1e8]
                p-8
                sticky
                top-10
              "
            >
              <h2
                className="
                  uppercase
                  tracking-[3px]
                  text-[0.9rem]
                  text-[#213131]
                  mb-8
                "
              >
                Resumo
              </h2>

              <div className="flex justify-between mb-4">
                <span className="text-[#213131] opacity-70">
                  Subtotal
                </span>

                <span className="text-[#213131]">
                  {subtotalFormatado}
                </span>
              </div>

              <div className="flex justify-between mb-8">
                <span className="text-[#213131] opacity-70">
                  Entrega
                </span>

                <span className="text-[#213131]">
                  Calculado no checkout
                </span>
              </div>

              <div
                className="
                  border-t
                  border-[rgba(33,49,49,0.1)]
                  pt-5
                  flex
                  justify-between
                  mb-10
                "
              >
                <span
                  className="
                    uppercase
                    tracking-[2px]
                    text-[#213131]
                    text-[0.8rem]
                  "
                >
                  Total
                </span>

                <span
                  className="
                    text-[#d6988e]
                    text-[1rem]
                    font-medium
                  "
                >
                  {subtotalFormatado}
                </span>
              </div>

              <button
                onClick={finalizarPedido}
                className="
                  w-full
                  bg-[#213131]
                  text-[#efede1]
                  py-4
                  uppercase
                  tracking-[2px]
                  text-[0.75rem]
                  border
                  border-[#213131]
                  hover:bg-transparent
                  hover:text-[#213131]
                  transition-all
                  mb-4
                "
              >
                Finalizar pedido
              </button>

              <Link
                href="/produtos"
                className="
                  block
                  text-center
                  text-[#213131]
                  text-[0.7rem]
                  uppercase
                  tracking-[2px]
                  hover:opacity-70
                  transition-all
                "
              >
                Continuar comprando
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}