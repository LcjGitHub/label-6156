import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout, Typography } from '@douyinfe/semi-ui';
import { TrailList } from './pages/TrailList';
import { TrailDetail } from './pages/TrailDetail';
import { TrailCompare } from './pages/TrailCompare';
import { TrailStats } from './pages/TrailStats';
import { TrailRecommend } from './pages/TrailRecommend';
import { Favorites } from './pages/Favorites';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * 应用根组件
 */
function App() {
  return (
    <BrowserRouter>
      <Layout className="app-layout">
        <Header className="app-header">
          <Title heading={4} style={{ color: 'var(--semi-color-white)' }}>
            徒步路线 Mock 浏览
          </Title>
        </Header>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<TrailList />} />
            <Route path="/trail/:id" element={<TrailDetail />} />
            <Route path="/compare" element={<TrailCompare />} />
            <Route path="/stats" element={<TrailStats />} />
            <Route path="/recommend" element={<TrailRecommend />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
