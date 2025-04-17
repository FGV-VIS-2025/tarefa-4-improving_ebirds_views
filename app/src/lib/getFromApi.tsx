import Papa, { ParseResult, ParseMeta, ParseError } from 'papaparse';

export async function getUnique(data : ParseResult<unknown>, key : string) {

    return [...new Set(data.data.map((item:any) => item[key]))];

}

export async function getKeys(data : ParseResult<unknown>) {
    const keys = data.meta.fields ?? []; // Adicionando verificação para keys
    return keys;
}

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
}

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
}

function defaultMeta(): ParseMeta {
    return {
      delimiter: '',
      linebreak: '',
      aborted: false,
      truncated: false,
      cursor: 0,
    };
}

// Resultado padrão vazio, opcionalmente com erros
function emptyParseResult(errors: ParseError[] = []): ParseResult<unknown> {
return {
    data: [],
    errors,
    meta: defaultMeta(),
};
}