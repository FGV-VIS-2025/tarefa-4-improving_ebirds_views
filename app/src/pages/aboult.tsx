import Navbar from '@/components/Navbar';

export async function getStaticProps() {
    const res = await fetch('https://api.ebird.org/v2/data/obs/KZ/recent', {
        headers: {
            'X-eBirdApiToken': process.env.EB_TOKEN!, // ajuste sua chave aqui
        },
    });

    if (!res.ok) {
    console.error(`Erro na resposta da API: ${res.status}`);
    return { props: { dados: [] } };
    }
    const data = await res.json();
  
    return {
      props: {
        dados: data,
      },
    };
  }
  
  export default function Home({ dados }: { dados: any }) {
    return (
      <div>
        <Navbar />
        <h1>Dados da API:</h1>
        <pre>{JSON.stringify(dados, null, 2)}</pre>
      </div>
    );
  }