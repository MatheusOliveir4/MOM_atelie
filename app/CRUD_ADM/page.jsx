"use client";

import { useEffect, useState } from "react";
import Parse from "../../lib/parse";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { FormInput } from "../components/FormInput";

export default function AdminProdutosPage() {
  const [usuario, setUsuario] = useState(undefined);

  const [produtos, setProdutos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [salvando, setSalvando] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [imagemFile, setImagemFile] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
    descricao: "",
    categoria: "",
  });

  useEffect(() => {
    async function verificarUsuario() {
      try {
        const currentUser = await Parse.User.currentAsync();

        setUsuario(currentUser);

        if (
          currentUser &&
          currentUser.get("adm") === true
        ) {
          carregarProdutos();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);

        setLoading(false);
      }
    }

    verificarUsuario();
  }, []);

  async function carregarProdutos() {
    try {
      const Produto = Parse.Object.extend("Produtos");

      const query = new Parse.Query(Produto);

      query.descending("createdAt");

      const results = await query.find();

      const produtosFormatados = results.map((item) => ({
        id: item.id,
        nome: item.get("nome"),
        preco: item.get("preco"),
        imagem: item.get("imagem")?.url(),
        descricao: item.get("descricao"),
        categoria: item.get("categoria"),
      }));

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleImagemChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setImagemFile(file);
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result.split(",")[1]);
      };

      reader.onerror = (error) => reject(error);
    });
  }

  async function uploadImagem() {
    if (!imagemFile) {
      return null;
    }

    const base64 = await toBase64(imagemFile);

    const parseFile = new Parse.File(
      imagemFile.name,
      { base64 }
    );

    await parseFile.save();

    return parseFile;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSalvando(true);

      const Produto = Parse.Object.extend("Produtos");

      let produto;

      if (editingId) {
        const query = new Parse.Query(Produto);

        produto = await query.get(editingId);
      } else {
        produto = new Produto();
      }

      const imagemParse = await uploadImagem();

      produto.set("nome", formData.nome);

      produto.set("preco", Number(formData.preco));

      produto.set("descricao", formData.descricao);

      produto.set("categoria", formData.categoria);

      if (imagemParse) {
        produto.set("imagem", imagemParse);
      }

      const resultado = await produto.save();

      console.log("Produto salvo:", resultado);

      alert(
        editingId
          ? "Produto atualizado com sucesso!"
          : "Produto criado com sucesso!"
      );

      limparFormulario();

      carregarProdutos();
    } catch (error) {
      console.error("ERRO COMPLETO:", error);

      alert(error.message || "Erro ao salvar produto.");
    } finally {
      setSalvando(false);
    }
  }

  function editarProduto(produto) {
    setEditingId(produto.id);

    setFormData({
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      categoria: produto.categoria,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function removerProduto(id) {
    const confirmar = confirm(
      "Deseja realmente remover este produto?"
    );

    if (!confirmar) return;

    try {
      const Produto = Parse.Object.extend("Produtos");

      const query = new Parse.Query(Produto);

      const produto = await query.get(id);

      await produto.destroy();

      alert("Produto removido com sucesso!");

      carregarProdutos();
    } catch (error) {
      console.error(error);

      alert("Erro ao remover produto.");
    }
  }

  function limparFormulario() {
    setEditingId(null);

    setImagemFile(null);

    setFormData({
      nome: "",
      preco: "",
      descricao: "",
      categoria: "",
    });
  }

  if (usuario === undefined) {
    return (
      <div className="min-h-screen bg-[#efede1] flex items-center justify-center">
        <p className="text-[#213131] tracking-[2px] uppercase text-[0.8rem]">
          Carregando...
        </p>
      </div>
    );
  }

  if (!usuario || usuario.get("adm") !== true) {
    return (
      <div className="min-h-screen bg-[#efede1] flex items-center justify-center">
        <p className="text-[#213131] tracking-[2px] uppercase text-[0.8rem]">
          Acesso restrito
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
              text-[1.4rem]
              uppercase
              tracking-[5px]
              text-[#213131]
              mb-4
              font-light
            "
          >
            Painel Administrativo
          </h1>

          <p className="text-[#213131] opacity-70 text-[0.95rem]">
            Gerencie os produtos da loja.
          </p>
        </div>

        <section
          className="
            bg-[#f4f1e8]
            border
            border-[rgba(33,49,49,0.1)]
            p-6
            sm:p-10
            mb-16
          "
        >
          <h2
            className="
              uppercase
              tracking-[3px]
              text-[0.85rem]
              text-[#213131]
              mb-8
            "
          >
            {editingId ? "Editar Produto" : "Novo Produto"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              <FormInput
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome do produto"
              />

              <FormInput
                label="Preço"
                name="preco"
                type="number"
                value={formData.preco}
                onChange={handleChange}
                placeholder="0.00"
              />

              <FormInput
                label="Categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Categoria"
              />
            </div>

            <div className="mt-8">
              <label
                className="
                  block
                  text-[0.65rem]
                  text-[#213131]
                  mb-[10px]
                  tracking-[1px]
                  font-semibold
                "
              >
                Imagem do Produto
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
                className="
                  w-full
                  border
                  border-[#213131]
                  p-4
                  bg-transparent
                  text-[#213131]
                "
              />
            </div>

            <div className="mt-6">
              <label
                className="
                  block
                  text-[0.65rem]
                  text-[#213131]
                  mb-[5px]
                  tracking-[1px]
                  font-semibold
                "
              >
                Descrição
              </label>

              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descrição do produto"
                className="
                  w-full
                  min-h-[140px]
                  bg-transparent
                  border
                  border-[#213131]
                  outline-none
                  p-4
                  text-[#213131]
                  resize-none
                "
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                type="submit"
                disabled={salvando}
                className="
                  bg-[#213131]
                  text-[#efede1]
                  px-8
                  py-3
                  uppercase
                  tracking-[2px]
                  text-[0.75rem]
                  border
                  border-[#213131]
                  hover:bg-transparent
                  hover:text-[#213131]
                  transition-all
                  disabled:opacity-50
                "
              >
                {salvando
                  ? "Salvando..."
                  : editingId
                  ? "Salvar alterações"
                  : "Cadastrar produto"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={limparFormulario}
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
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2
            className="
              uppercase
              tracking-[3px]
              text-[0.85rem]
              text-[#213131]
              mb-10
            "
          >
            Produtos cadastrados
          </h2>

          {loading ? (
            <p className="text-[#213131] opacity-70">
              Carregando produtos...
            </p>
          ) : produtos.length === 0 ? (
            <p className="text-[#213131] opacity-70">
              Nenhum produto cadastrado.
            </p>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="
                    bg-[#f4f1e8]
                    border
                    border-[rgba(33,49,49,0.1)]
                    overflow-hidden
                  "
                >
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="
                      w-full
                      h-[300px]
                      object-cover
                    "
                  />

                  <div className="p-6">
                    <div className="mb-5">
                      <h3
                        className="
                          uppercase
                          tracking-[2px]
                          text-[0.85rem]
                          text-[#213131]
                          mb-2
                        "
                      >
                        {produto.nome}
                      </h3>

                      <p className="text-[#d6988e] text-[0.9rem] mb-3">
                        {Number(produto.preco).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </p>

                      <p
                        className="
                          text-[#213131]
                          opacity-70
                          text-[0.85rem]
                          leading-relaxed
                        "
                      >
                        {produto.descricao}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => editarProduto(produto)}
                        className="
                          border
                          border-[#213131]
                          px-5
                          py-2
                          uppercase
                          tracking-[2px]
                          text-[0.7rem]
                          text-[#213131]
                          hover:bg-[#213131]
                          hover:text-[#efede1]
                          transition-all
                        "
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => removerProduto(produto.id)}
                        className="
                          border
                          border-[#a66]
                          px-5
                          py-2
                          uppercase
                          tracking-[2px]
                          text-[0.7rem]
                          text-[#a66]
                          hover:bg-[#a66]
                          hover:text-white
                          transition-all
                        "
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}