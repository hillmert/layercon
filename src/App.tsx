import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Summary from '@/pages/Summary';
import Cases from '@/pages/Cases';
import CaseDetail from '@/pages/CaseDetail';
import Results from '@/pages/Results';
import Data from '@/pages/Data';
import Mapping from '@/pages/Mapping';
import Config from '@/pages/Config';
import CreateCase from '@/pages/CreateCase';


export default function App() {
return (
<BrowserRouter>
<Layout>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/summary" element={<Summary />} />
<Route path="/cases" element={<Cases />} />
<Route path="/cases/:id" element={<CaseDetail />} />
<Route path="/cases/:id/results" element={<Results />} />
{/* Ruta accesible pero NO listada en Sidebar */}
<Route path="/create_case" element={<CreateCase />} />
<Route path="/data" element={<Data />} />
<Route path="/mapping" element={<Mapping />} />
<Route path="/config" element={<Config />} />
</Routes>
</Layout>
</BrowserRouter>
);
}