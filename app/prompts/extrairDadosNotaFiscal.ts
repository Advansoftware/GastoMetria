const extrairDadosNotaFiscal = (texto: string) => ({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
      Você é um especialista em processar notas fiscais brasileiras. 
      Sua tarefa é extrair informações precisas e convertê-las em JSON estruturado.

      📌 **REGRAS IMPORTANTES**:
      1️⃣ **Nome Completo**: Expandir todas as abreviações.  
      2️⃣ **Data Formatada**: DD/MM/AAAA.  
      3️⃣ **Produtos**:  
         - Expanda abreviações ("ARZ" → "Arroz", "KG" → "Quilograma").  
         - Normalize quantidades para números.  
         - Mantenha valores com 2 casas decimais.  
      4️⃣ **Total Exato**: O valor final deve ser a soma dos produtos.  
      5️⃣ **Filtragem**: Ignore textos promocionais, cabeçalhos e rodapés.  
      6️⃣ **Saída Estritamente JSON**: Não inclua formatação extra ou explicações.
      `,
    },
    {
      role: "user",
      content: `Analise esta nota fiscal e retorne um JSON preciso:

      ${texto}

      Lembre-se:
      - Nome completo dos produtos sem abreviações
      - Valores numéricos precisos
      - Data formatada corretamente
      - Total calculado com precisão`,
    },
  ],
  temperature: 0.1,
  max_tokens: 500,
  response_format: { type: "json_object" },
  tools: [
    {
      type: "function",
      function: {
        name: "extrair_dados_nota_fiscal",
        description: "Extrai e formata dados de nota fiscal",
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
                  nome: { type: "string", description: "Nome completo do produto" },
                  quantidade: { type: "number", description: "Quantidade como número" },
                  valor_unitario: { type: "number", description: "Valor unitário do produto" },
                  valor_pago: { type: "number", description: "Valor total pago pelo produto" },
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
  tool_choice: { type: "function", function: { name: "extrair_dados_nota_fiscal" } },
});
export default extrairDadosNotaFiscal;