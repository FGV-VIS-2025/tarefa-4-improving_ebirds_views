import Papa, { ParseResult, ParseMeta, ParseError } from 'papaparse';
import axios from 'axios';
import {ReportBirds} from '@/lib/Components';

axios.get('http://exemplo.com', { timeout: 100000 }) // Aumenta o timeout para 30 segundos
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

const data_taxonomia_ebird = await getCsv('https://api.ebird.org/v2/ref/taxonomy/ebird');
const data_taxonomia_local =await getJson('https://api.ebird.org/v2/ref/region/list/country/world');

export const data_categorias_ebirds = await getUnique(data_taxonomia_ebird, 'COMMON_NAME');



export const data_global = async (): Promise<ReportBirds[]> => {
    const unique_locates = getUniqueJson(data_taxonomia_local, 'code');
    return (await Promise.all(unique_locates.map(item => 
      getJsonFromCode(item)))).flat();
  };


const data_categorias_ebirds_function = async (): Promise<string[]> => {
    const data = await data_global();
    return getUniqueJson(data, 'comName');
  };

export function getJsonFromCode(codeRegion: string) {
    return getJson(`https://api.ebird.org/v2/data/obs/${codeRegion}/recent?back=5&cat=species&maxResults=1`);
    };

export async function getUnique(data : ParseResult<unknown>, key : string) {

    return [...new Set(data.data.map((item:any) => item[key]))];

};

export function getUniqueJson<T extends Record<string, any>>(data: T[], key: keyof T): any[] {
    return [...new Set(data.map(item => item[key]))];
  };

export async function getKeys(data : ParseResult<unknown>) {
    const keys = data.meta.fields ?? []; // Adicionando verificação para keys
    return keys;
};

export const keys_ebird = await getKeys(data_taxonomia_ebird);

export async function getJson(url: string) {
    const res = await fetch(url, {
        headers: {
            'X-eBirdApiToken': process.env.EB_TOKEN!, 
        },
    });
    // Check if the response is ok (status code 200)
    // If not, log the error and return an empty array
    if (!res.ok) {
      console.error(`Erro na resposta da API: ${res.status}`);
      return emptyParseResult();
    }
    const data = await res.json();
    return data;
};

export async function getCsv(url: string) {
    const res = await fetch(url, {
        headers: {
            'X-eBirdApiToken': process.env.EB_TOKEN!, 
        },
    });
    // Check if the response is ok (status code 200)
    // If not, log the error and return an empty array
    if (!res.ok) {
      console.error(`Erro na resposta da API: ${res.status}`);
      return emptyParseResult();
    }
    const data = await res.text();
    const parsedData = Papa.parse(data, { header: true, skipEmptyLines: true });
    return parsedData;
};

function defaultMeta(): ParseMeta {
    return {
      delimiter: '',
      linebreak: '',
      aborted: false,
      truncated: false,
      cursor: 0,
    };
};

// Resultado padrão vazio, opcionalmente com erros
function emptyParseResult(errors: ParseError[] = []): ParseResult<unknown> {
return {
    data: [],
    errors,
    meta: defaultMeta(),
};
};


