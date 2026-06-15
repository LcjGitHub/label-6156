import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, Card, Descriptions, Typography, Empty, Toast } from '@douyinfe/semi-ui';
import { IconArrowLeft, IconStar, IconStarStroked } from '@douyinfe/semi-icons';
import { ElevationChart, type ChartMarkerPoint } from '../components/ElevationChart';
import { getTrailById } from '../utils/trails';
import { isFavorite, toggleFavorite } from '../utils/favorites';

const { Title, Paragraph } = Typography;

/**
 * 路线详情页
 */
export function TrailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trail = id ? getTrailById(id) : undefined;
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      setFavorited(isFavorite(id));
    }
  }, [id]);

  const handleToggleFavorite = () => {
    if (!id) return;
    const newStatus = toggleFavorite(id);
    setFavorited(newStatus);
    Toast.success(newStatus ? '已添加到收藏' : '已取消收藏');
  };

  if (!trail) {
    return (
      <div className="page-container">
        <Card>
          <Empty
            title="路线不存在"
            description="请返回列表选择其他路线"
          />
          <Button
            icon={<IconArrowLeft />}
            onClick={() => navigate('/')}
            style={{ marginTop: 16 }}
          >
            返回列表
          </Button>
        </Card>
      </div>
    );
  }

  const descriptionData = [
    { key: '名称', value: trail.name },
    { key: '区域', value: trail.region },
    { key: '总里程', value: `${trail.distance.toFixed(1)} km` },
    { key: '累计爬升', value: `${trail.elevationGain} m` },
    { key: '预计耗时', value: trail.duration },
    { key: '难度', value: trail.difficulty },
    { key: '采样点数', value: `${trail.elevationProfile.length} 个` },
  ];

  const profile = trail.elevationProfile;
  let maxIndex = 0;
  let maxElevation = profile[0].elevation;
  for (let i = 1; i < profile.length; i++) {
    if (profile[i].elevation > maxElevation) {
      maxElevation = profile[i].elevation;
      maxIndex = i;
    }
  }

  const chartMarkers: ChartMarkerPoint[] = [
    {
      index: 0,
      label: '起点',
      color: '#52c41a',
    },
    {
      index: maxIndex,
      label: '最高点',
      color: '#f5222d',
    },
    {
      index: profile.length - 1,
      label: '终点',
      color: '#1890ff',
    },
  ];

  return (
    <div className="page-container">
      <Button
        icon={<IconArrowLeft />}
        theme="borderless"
        onClick={() => navigate('/')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title heading={3} style={{ margin: 0 }}>{trail.name}</Title>
          <Button
            icon={favorited ? <IconStar style={{ color: '#FFC107' }} /> : <IconStarStroked />}
            theme={favorited ? 'solid' : 'borderless'}
            onClick={handleToggleFavorite}
          >
            {favorited ? '已收藏' : '收藏'}
          </Button>
        </div>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          {trail.description}
        </Paragraph>
        <Descriptions
          data={descriptionData}
          row
          style={{ marginTop: 24 }}
        />
      </Card>

      <Card>
        <ElevationChart data={trail.elevationProfile} markers={chartMarkers} />
      </Card>
    </div>
  );
}
