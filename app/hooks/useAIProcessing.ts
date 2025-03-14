import type { AIAnalysis } from "../types/camera";
import { openai, isDevEnv } from "../config/openai";

const useAIProcessing = () => {
  const processarTextoComIA = async (texto: string): Promise<AIAnalysis> => {
    try {
      if (isDevEnv) {
        console.log("Texto recebido:", texto);
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Você é um especialista em processar notas fiscais brasileiras. 
Sua tarefa é extrair informações precisas e convertê-las em JSON estruturado.

EXEMPLO DE ENTRADA:
---
Rest. ABC  
15/08/2023  
ARZ 2KG - R$ 10,00  
FEIJ 1KG - R$ 8,50  
Total: R$ 18,50  
---

EXEMPLO DE SAÍDA:
{
  "estabelecimento": "Restaurante ABC",
  "data": "15/08/2023",
  "produtos": [
    { "nome": "Arroz", "quantidade": 2, "valor_pago": 10.00 },
    { "nome": "Feijão", "quantidade": 1, "valor_pago": 8.50 }
  ],
  "total_devido": 18.50
}

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
              name: "processar_nota",
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
                        nome: {
                          type: "string",
                          description: "Nome completo do produto, sem abreviações e com unidade de medida quando aplicável",
                        },
                        quantidade: {
                          type: "number",
                          description: "Quantidade como número (ex: 1, 2.5)",
                        },
                        valor_pago: {
                          type: "number",
                          description: "Valor pago pelo produto com 2 casas decimais",
                        },
                      },
                    },
                  },
                  total_devido: {
                    type: "number",
                    description: "Valor total da nota com 2 casas decimais",
                  },
                },
                required: ["estabelecimento", "data", "produtos", "total_devido"]
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "processar_nota" } },
      });

      // Extraindo resposta da IA
      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        throw new Error("Resposta vazia da IA");
      }

      const resultado = JSON.parse(toolCall.function.arguments) as AIAnalysis;

      // Validação extra (opcional)
      if (!resultado.estabelecimento || !resultado.data || !resultado.produtos.length || !resultado.total_devido) {
        throw new Error("Resposta incompleta ou malformada");
      }

      return resultado;
    } catch (error) {
      if (isDevEnv) {
        console.error("Erro detalhado:", error);
      }
      throw new Error("Falha ao analisar com IA");
    }
  };

  return { processarTextoComIA };
};

export default useAIProcessing;
