export const extrairDadosNotaFiscalEssencia = (texto: string) => ({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
  Você é um especialista em processar notas fiscais brasileiras. 
  Sua tarefa é extrair informações precisas e convertê-las em JSON estruturado, mantendo os dados principais da nota fiscal e, para cada produto, retornando apenas a essência do nome (ou seja, o nome principal, sem marcas, modelos, tamanhos, embalagens ou outros detalhes irrelevantes).
  
  📌 **REGRAS IMPORTANTES**:
  1️⃣ **Estabelecimento:** Retorne o nome completo do estabelecimento, sem abreviações.
  2️⃣ **Data:** Formate a data no padrão DD/MM/AAAA.
  3️⃣ **Produtos:** 
     - Para cada produto, retorne:
       - **nome:** Apenas a essência do nome do produto (por exemplo, "Cerv Bohemia 412 ml" deve ser retornado como "Cerveja", "Coca Cola 600 ml" deve ser retornado como "Refrigerante").
       - **quantidade:** Número.
       - **valor_unitario:** Valor unitário com 2 casas decimais.
       - **valor_pago:** Valor total pago com 2 casas decimais.
  4️⃣ **Total Exato:** O valor final deve ser a soma dos produtos.
  5️⃣ **Filtragem:** Ignore textos promocionais, cabeçalhos e rodapés.
  6️⃣ **Saída Estritamente JSON:** Não inclua explicações ou formatação extra.
        `,
      },
      {
        role: "user",
        content: `Analise esta nota fiscal e retorne um JSON preciso:
  
  ${texto}
  
  Lembre-se:
  - Estabelecimento: Nome completo, sem abreviações.
  - Data: No formato DD/MM/AAAA.
  - Produtos: Para cada produto, retorne somente a essência do nome no campo "nome", junto com quantidade, valor unitário e valor pago. Ignore marcas e outros detalhes desnecessários, como tamanhos e embalagens.
  - Total: Valor exato da nota.`,
      },
    ],
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: "json_object" },
    tools: [
      {
        type: "function",
        function: {
          name: "extrair_dados_nota_fiscal_essencia",
          description: "Extrai e formata os dados da nota fiscal, retornando os dados completos com a essência do nome de cada produto.",
          parameters: {
            type: "object",
            properties: {
              estabelecimento: {
                type: "string",
                description: "Nome completo do estabelecimento, sem abreviações",
              },
              data: {
                type: "string",
                pattern: "^\\d{2}/\\d{2}/\\d{4}$",
                description: "Data no formato DD/MM/AAAA",
              },
              produtos: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nome: { 
                      type: "string", 
                      description: "Essência do nome do produto (apenas o nome principal, ignorando marcas, tamanhos, embalagens e detalhes adicionais)" 
                    },
                    quantidade: { type: "number", description: "Quantidade como número" },
                    valor_unitario: { type: "number", description: "Valor unitário do produto com 2 casas decimais" },
                    valor_pago: { type: "number", description: "Valor total pago pelo produto com 2 casas decimais" },
                  },
                  required: ["nome", "quantidade", "valor_unitario", "valor_pago"],
                },
              },
              total_devido: { type: "number", description: "Valor total da nota" },
            },
            required: ["estabelecimento", "data", "produtos", "total_devido"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "extrair_dados_nota_fiscal_essencia" } },
  });
  
  export default extrairDadosNotaFiscalEssencia;
  