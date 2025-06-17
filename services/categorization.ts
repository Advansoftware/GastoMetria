import Constants from 'expo-constants';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey;

export interface CategoriaInfo {
  categoria: string;
  subcategoria?: string;
  icone: string;
  cor: string;
}

// Mapeamento de categorias predefinidas
const CATEGORIAS_PREDEFINIDAS: Record<string, CategoriaInfo> = {
  'alimentacao': {
    categoria: 'Alimentação',
    icone: 'restaurant',
    cor: '#F59E0B'
  },
  'bebidas': {
    categoria: 'Bebidas',
    icone: 'local-drink',
    cor: '#06B6D4'
  },
  'higiene': {
    categoria: 'Higiene',
    icone: 'soap',
    cor: '#8B5CF6'
  },
  'limpeza': {
    categoria: 'Limpeza',
    icone: 'cleaning-services',
    cor: '#10B981'
  },
  'padaria': {
    categoria: 'Padaria',
    icone: 'bakery-dining',
    cor: '#F97316'
  },
  'acougue': {
    categoria: 'Açougue',
    icone: 'restaurant-menu',
    cor: '#DC2626'
  },
  'hortifruti': {
    categoria: 'Hortifruti',
    icone: 'eco',
    cor: '#16A34A'
  },
  'medicamentos': {
    categoria: 'Medicamentos',
    icone: 'medical-services',
    cor: '#EF4444'
  },
  'outros': {
    categoria: 'Outros',
    icone: 'category',
    cor: '#6B7280'
  }
};

// Cache local para evitar requisições desnecessárias
const cacheCategorizacao = new Map<string, CategoriaInfo>();

export async function categorizarProduto(nomeProduto: string): Promise<CategoriaInfo> {
  // Verifica se já existe no cache
  if (cacheCategorizacao.has(nomeProduto)) {
    return cacheCategorizacao.get(nomeProduto)!;
  }

  try {
    // Primeiro tenta categorização baseada em regras
    const categoriaRegra = categorizarPorRegras(nomeProduto);
    if (categoriaRegra) {
      cacheCategorizacao.set(nomeProduto, categoriaRegra);
      return categoriaRegra;
    }

    // Se não encontrou por regras, usa IA
    if (OPENAI_API_KEY) {
      const categoriaIA = await categorizarComIA(nomeProduto);
      if (categoriaIA) {
        cacheCategorizacao.set(nomeProduto, categoriaIA);
        return categoriaIA;
      }
    }

    // Fallback para categoria "outros"
    const categoriaFallback = CATEGORIAS_PREDEFINIDAS.outros;
    cacheCategorizacao.set(nomeProduto, categoriaFallback);
    return categoriaFallback;

  } catch (error) {
    console.error('Erro ao categorizar produto:', error);
    return CATEGORIAS_PREDEFINIDAS.outros;
  }
}

function categorizarPorRegras(nomeProduto: string): CategoriaInfo | null {
  const nome = nomeProduto.toLowerCase();

  // Regras para alimentação
  if (nome.includes('arroz') || nome.includes('feijao') || nome.includes('macarrao') || 
      nome.includes('farinha') || nome.includes('acucar') || nome.includes('sal') ||
      nome.includes('oleo') || nome.includes('azeite') || nome.includes('molho') ||
      nome.includes('tempero') || nome.includes('condimento') || nome.includes('biscoito') ||
      nome.includes('bolacha') || nome.includes('chocolate') || nome.includes('doce') ||
      nome.includes('cafe') || nome.includes('cha') || nome.includes('milho') ||
      nome.includes('aveia') || nome.includes('granola') || nome.includes('cereal')) {
    return CATEGORIAS_PREDEFINIDAS.alimentacao;
  }

  // Regras para bebidas
  if (nome.includes('agua') || nome.includes('refrigerante') || nome.includes('suco') ||
      nome.includes('cerveja') || nome.includes('vinho') || nome.includes('vodka') ||
      nome.includes('whisky') || nome.includes('leite') || nome.includes('iogurte') ||
      nome.includes('vitamina') || nome.includes('energetico') || nome.includes('isotônico')) {
    return CATEGORIAS_PREDEFINIDAS.bebidas;
  }

  // Regras para higiene
  if (nome.includes('sabonete') || nome.includes('shampoo') || nome.includes('condicionador') ||
      nome.includes('creme dental') || nome.includes('pasta de dente') || nome.includes('escova') ||
      nome.includes('desodorante') || nome.includes('perfume') || nome.includes('papel higienico') ||
      nome.includes('absorvente') || nome.includes('protetor solar') || nome.includes('hidratante') ||
      nome.includes('barbear') || nome.includes('aparelho')) {
    return CATEGORIAS_PREDEFINIDAS.higiene;
  }

  // Regras para limpeza
  if (nome.includes('detergente') || nome.includes('sabao') || nome.includes('amaciante') ||
      nome.includes('agua sanitaria') || nome.includes('desinfetante') || nome.includes('alvejante') ||
      nome.includes('limpa') || nome.includes('esponja') || nome.includes('pano') ||
      nome.includes('vassoura') || nome.includes('rodo') || nome.includes('balde')) {
    return CATEGORIAS_PREDEFINIDAS.limpeza;
  }

  // Regras para padaria
  if (nome.includes('pao') || nome.includes('bolo') || nome.includes('torta') ||
      nome.includes('croissant') || nome.includes('rosquinha') || nome.includes('pãozinho') ||
      nome.includes('frances') || nome.includes('doce') && (nome.includes('pao') || nome.includes('padaria'))) {
    return CATEGORIAS_PREDEFINIDAS.padaria;
  }

  // Regras para açougue
  if (nome.includes('carne') || nome.includes('frango') || nome.includes('peixe') ||
      nome.includes('linguica') || nome.includes('salsicha') || nome.includes('presunto') ||
      nome.includes('mortadela') || nome.includes('bacon') || nome.includes('file') ||
      nome.includes('lombo') || nome.includes('figado') || nome.includes('coracao') ||
      nome.includes('boi') || nome.includes('porco') || nome.includes('bovino') ||
      nome.includes('suino') || nome.includes('ave')) {
    return CATEGORIAS_PREDEFINIDAS.acougue;
  }

  // Regras para hortifruti
  if (nome.includes('tomate') || nome.includes('cebola') || nome.includes('alho') ||
      nome.includes('batata') || nome.includes('cenoura') || nome.includes('abobrinha') ||
      nome.includes('pimentao') || nome.includes('alface') || nome.includes('repolho') ||
      nome.includes('banana') || nome.includes('maca') || nome.includes('laranja') ||
      nome.includes('limao') || nome.includes('uva') || nome.includes('manga') ||
      nome.includes('abacaxi') || nome.includes('mamao') || nome.includes('melancia') ||
      nome.includes('melao') || nome.includes('maracuja') || nome.includes('morango') ||
      nome.includes('verdura') || nome.includes('fruta') || nome.includes('legume')) {
    return CATEGORIAS_PREDEFINIDAS.hortifruti;
  }

  return null;
}

async function categorizarComIA(nomeProduto: string): Promise<CategoriaInfo | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em categorização de produtos de supermercado. 
            Categorize o produto em uma das seguintes categorias:
            - alimentacao (produtos básicos como arroz, feijão, massas, etc.)
            - bebidas (águas, refrigerantes, sucos, leites, etc.)
            - higiene (sabonetes, shampoos, cremes dentais, etc.)
            - limpeza (detergentes, desinfetantes, produtos de limpeza)
            - padaria (pães, bolos, produtos de panificação)
            - acougue (carnes, frangos, embutidos)
            - hortifruti (frutas, verduras, legumes)
            - medicamentos (remédios, suplementos)
            - outros (qualquer coisa que não se encaixe nas categorias acima)
            
            Responda APENAS com o nome da categoria, sem explicações.`
          },
          {
            role: 'user',
            content: `Categorize este produto: ${nomeProduto}`
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const categoria = data.choices[0]?.message?.content?.trim().toLowerCase();

    if (categoria && CATEGORIAS_PREDEFINIDAS[categoria]) {
      return CATEGORIAS_PREDEFINIDAS[categoria];
    }

    return null;
  } catch (error) {
    console.error('Erro na categorização com IA:', error);
    return null;
  }
}

export function obterTodasCategorias(): CategoriaInfo[] {
  return Object.values(CATEGORIAS_PREDEFINIDAS);
}

export function obterCategoriaPorNome(nome: string): CategoriaInfo | null {
  return CATEGORIAS_PREDEFINIDAS[nome.toLowerCase()] || null;
}
