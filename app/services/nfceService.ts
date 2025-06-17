import { Produto, ResultadoAnalise } from '../types/camera';
import { categorizarProduto, CategoriaInfo } from '../../services/categorization';

async function extractNFCeData(url: string): Promise<ResultadoAnalise | null> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`nfceService: Tentativa ${attempt}/${maxRetries} - Fazendo requisição para: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log('nfceService: HTML recebido, tamanho:', html.length);

      // Regex ajustados para o novo formato
      const estabelecimentoMatch = html.match(/<h4>\s*<b>([^<]+)<\/b>\s*<\/h4>/i);
      
      const dataMatch = html.match(/(\d{2}\/\d{2}\/\d{4})\s*\d{2}:\d{2}:\d{2}/);

      // Regex para produtos no novo formato
      const produtosRegex = /<h7>([^<]+)<\/h7>.*?Qtde total de ítens:\s*([\d.,]+).*?UN:\s*(\w+).*?Valor total R\$:\s*R\$\s*([\d.,]+)/gs;
      const produtos: Produto[] = [];
      
      let match;
      while ((match = produtosRegex.exec(html)) !== null) {
        const nome = match[1].trim();
        const quantidade = parseFloat(match[2].replace(',', '.'));
        const valorTotal = parseFloat(match[4].replace(',', '.'));
        const valorUnitario = valorTotal / quantidade;

        if (!isNaN(quantidade) && !isNaN(valorTotal)) {
          // Categoriza o produto automaticamente
          const categoria: CategoriaInfo = await categorizarProduto(nome);
          
          produtos.push({
            nome,
            quantidade,
          valor_unitario: Number(valorUnitario.toFixed(2)),
          valor_pago: valorTotal,
          categoria: categoria.categoria,
          icone: categoria.icone,
          cor: categoria.cor
        });
      }
    }

    // Regex para total no novo formato
    const totalMatch = html.match(/Valor total R\$\s*<\/strong>.*?<strong>([\d.,]+)<\/strong>/s);

    if (!estabelecimentoMatch?.[1] || !dataMatch?.[1] || !totalMatch?.[1]) {
      console.error('nfceService: Dados faltando:', {
        estabelecimento: estabelecimentoMatch?.[1],
        data: dataMatch?.[1],
        total: totalMatch?.[1],
        produtosEncontrados: produtos.length
      });
      throw new Error('Dados essenciais não encontrados no HTML da nota fiscal');
    }

    console.log('nfceService: Dados extraídos com sucesso:', {
      estabelecimento: estabelecimentoMatch[1].trim(),
      data: dataMatch[1],
      produtos: produtos.length,
      total: totalMatch[1]
    });

    return {
      estabelecimento: estabelecimentoMatch[1].trim(),
      data: dataMatch[1],
      produtos,
      total_devido: parseFloat(totalMatch[1].replace(',', '.'))
    };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`nfceService: Tentativa ${attempt} falhou:`, lastError.message);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s para próximas tentativas
        console.log(`nfceService: Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('nfceService: Todas as tentativas falharam. Último erro:', lastError?.message);
  throw lastError || new Error('Falha ao extrair dados da NFCe após múltiplas tentativas');
}

function isNFCeUrl(url: string): boolean {
  return url.includes('portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml');
}

// Exportar objeto com as funções
const nfceService = {
  extractNFCeData,
  isNFCeUrl
};

export { extractNFCeData, isNFCeUrl };
export default nfceService;
