import Navbar from '@/lib/Navbar';
import { getUnique,
  getKeys, 
  getJson, 
  getCsv, } from '@/lib/getFromApi';
import { get } from 'http';
import Papa from 'papaparse';

export async function getStaticProps() {

  try {
    const data1 = await getJson('https://api.ebird.org/v2/data/obs/AL/historic/2021/1/1');
    const data2 = await getCsv('https://api.ebird.org/v2/ref/taxonomy/ebird?Accept-Language=en');
    const keys2 = await getKeys(data2);
    const data3 = await getJson('https://api.ebird.org/v2/ref/region/list/country/world');
    
    // Extract the unique values
    const uniqueData = await getUnique(data2, keys2[0]);

    if (!data1 || !data2 || !data3) {
      throw new Error("Failed to fetch data from the API");
    } 

    return {
      props: {
        dados1: data1,
        dados2: uniqueData, 
        dados3: data3,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: { dados1: [], dados2: [], dados3: [] }, // Return an empty array or handle the error as needed
    };
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
        {/* <pre>{dados2}</pre> */}
        <pre>{JSON.stringify(dados3, null, 2)}</pre>
      </div>
    );
  }