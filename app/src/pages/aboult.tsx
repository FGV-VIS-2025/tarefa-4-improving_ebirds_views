import Navbar from '@/components/Navbar';
import Papa from 'papaparse';

export async function getStaticProps() {
    // Fetch data from the eBird API
    const res1 = await fetch('https://api.ebird.org/v2/data/obs/KZ/recent', {
        headers: {
            'X-eBirdApiToken': process.env.EB_TOKEN!, 
        },
    });
    const res2 = await fetch('https://api.ebird.org/v2/ref/taxonomy/ebird', {
      headers: {
          'X-eBirdApiToken': process.env.EB_TOKEN!, 
      },
    });
    const res3 = await fetch('https://api.ebird.org/v2/ref/taxa-locales/ebird', {
        headers: {
            'X-eBirdApiToken': process.env.EB_TOKEN!, 
        },
    });

    // Check if the response is ok (status code 200)
    // If not, log the error and return an empty array
    if (!res1.ok) {
      console.error(`Erro na resposta 01 da API: ${res1.status}`);
      return { props: { dados: [] } };
    }
    if (!res2.ok) {
      console.error(`Erro na resposta 02 da API: ${res2.status}`);
      return { props: { dados: [] } };
    }
    if (!res3.ok) {
      console.error(`Erro na resposta 03 da API: ${res3.status}`);
      return { props: { dados: [] } };
    }

    // Parse the JSON data from the response
    // Parse the CSV data from the response
    const data1 = await res1.json();
    const data2 = await res2.text();
    const parsedData2 = Papa.parse(data2, { header: true, skipEmptyLines: true }).data;
    const data3 = await res3.json();
    
    // Extract the unique values
    const uniqueData = {
      SCIENTIFIC_NAME: [...new Set(parsedData2.map((item: any) => item.SCIENTIFIC_NAME))],
      COMMON_NAME: [...new Set(parsedData2.map((item: any) => item.COMMON_NAME))],
      SPECIES_CODE: [...new Set(parsedData2.map((item: any) => item.SPECIES_CODE))],
      CATEGORY: [...new Set(parsedData2.map((item: any) => item.CATEGORY))],
      TAXON_ORDER: [...new Set(parsedData2.map((item: any) => item.TAXON_ORDER))],
      COM_NAME_CODES: [...new Set(parsedData2.map((item: any) => item.COM_NAME_CODES))],
      SCI_NAME_CODES: [...new Set(parsedData2.map((item: any) => item.SCI_NAME_CODES))],
      BANDING_CODES: [...new Set(parsedData2.map((item: any) => item.BANDING_CODES))],
      ORDER: [...new Set(parsedData2.map((item: any) => item.ORDER))],
      FAMILY_COM_NAME: [...new Set(parsedData2.map((item: any) => item.FAMILY_COM_NAME))],
      FAMILY_SCI_NAME: [...new Set(parsedData2.map((item: any) => item.FAMILY_SCI_NAME))],
      REPORT_AS: [...new Set(parsedData2.map((item: any) => item.REPORT_AS))],
      EXTINCT: [...new Set(parsedData2.map((item: any) => item.EXTINCT))],
      EXTINCT_YEAR: [...new Set(parsedData2.map((item: any) => item.EXTINCT_YEAR))],
      FAMILY_CODE: [...new Set(parsedData2.map((item: any) => item.FAMILY_CODE))],
    };
    return {
      props: {
        dados1: data1,
        dados2: uniqueData, 
        dados3: data3,
      },
    };
  }

  type Props = {
    dados1: any;
    dados2: any; 
    dados3: any;
  };
  
  export default function Home({ dados1, dados2, dados3 }: Props, ) {

    return (
      <div>
        <Navbar />
        <h1>Dados da API:</h1>
        <p>Dados obtidos da API:</p>
        <pre>{JSON.stringify(dados1[0], null, 2)}</pre>
        <pre>{JSON.stringify(dados2.EXTINCT, null, 2)}</pre>
      </div>
    );
  }