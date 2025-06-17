import { Produto, ResultadoAnalise } from '../types/camera';
import { categorizarProduto, CategoriaInfo } from '../../services/categorization';

async function extractNFCeData(url: string): Promise<ResultadoAnalise | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();

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
      console.error('Dados faltando:', {
        estabelecimento: estabelecimentoMatch?.[1],
        data: dataMatch?.[1],
        total: totalMatch?.[1]
      });
      throw new Error('Dados essenciais não encontrados');
    }

    return {
      estabelecimento: estabelecimentoMatch[1].trim(),
      data: dataMatch[1],
      produtos,
      total_devido: parseFloat(totalMatch[1].replace(',', '.'))
    };
  } catch (error) {
    console.error('Erro ao extrair dados da NFCe:', error);
    return null;
  }
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
