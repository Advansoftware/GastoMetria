import type { AIAnalysis, Produto } from "../types/camera";
import { openai, isDevEnv } from "../config/openai";
import extrairDadosNotaFiscal from "../prompts/extrairDadosNotaFiscal";
import extrairEssenciaProduto from "../prompts/extrairEssenciaProduto";

const useAIProcessing = () => {
  // Função para processar a nota fiscal completa
  const processarNotaFiscal = async (texto: string): Promise<AIAnalysis> => {
    try {
      if (isDevEnv) {
        console.log("Texto recebido para Nota Fiscal:", texto);
      }

      const parametros = extrairDadosNotaFiscal(texto);
      const completion = await openai.chat.completions.create(parametros as any);

      // Extraindo resposta da IA para a nota fiscal
      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        throw new Error("Resposta vazia da IA para nota fiscal");
      }

      // Convertendo a resposta para JSON
      const resultado = JSON.parse(toolCall.function.arguments) as AIAnalysis;

      // Ajustando valor_unitario se não existir
      resultado.produtos = resultado.produtos.map((produto: Produto) => ({
        ...produto,
        valor_unitario:
          produto.valor_unitario ||
          Number((produto.valor_pago / produto.quantidade).toFixed(2)),
      }));

      // Validações finais
      if (
        !resultado.estabelecimento ||
        !resultado.data ||
        !resultado.produtos.length ||
        !resultado.total_devido
      ) {
        throw new Error("Resposta incompleta ou malformada na nota fiscal");
      }

      return resultado;
    } catch (error) {
      if (isDevEnv) {
        console.error("Erro detalhado em processarNotaFiscal:", error);
      }
      throw new Error("Falha ao analisar nota fiscal com IA");
    }
  };

  // Função para extrair a essência do nome principal do produto,
  // retornando os dados no mesmo formato (AIAnalysis)
  const extrairProdutoPrincipal = async (texto: string): Promise<AIAnalysis> => {
    try {
      if (isDevEnv) {
        console.log("Texto recebido para Extrair Produto Principal:", texto);
      }
      const parametros = extrairEssenciaProduto(texto);
      const completion = await openai.chat.completions.create(parametros as any);

      // Extraindo resposta da IA para o nome principal do produto
      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        throw new Error("Resposta vazia da IA para produto principal");
      }

      // Convertendo a resposta para JSON no mesmo formato de AIAnalysis
      const resultado = JSON.parse(toolCall.function.arguments) as AIAnalysis;

      // Ajustando valor_unitario se não existir
      resultado.produtos = resultado.produtos.map((produto: Produto) => ({
        ...produto,
        valor_unitario:
          produto.valor_unitario ||
          Number((produto.valor_pago / produto.quantidade).toFixed(2)),
      }));

      // Validações finais
      if (
        !resultado.estabelecimento ||
        !resultado.data ||
        !resultado.produtos.length ||
        !resultado.total_devido
      ) {
        throw new Error("Resposta incompleta ou malformada para produto principal");
      }

      return resultado;
    } catch (error) {
      if (isDevEnv) {
        console.error("Erro detalhado em extrairProdutoPrincipal:", error);
      }
      throw new Error("Falha ao extrair produto principal com IA");
    }
  };

  return { processarNotaFiscal, extrairProdutoPrincipal };
};

export default useAIProcessing;
