import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button, Card, Descriptions, Typography, Empty, Toast, TextArea } from '@douyinfe/semi-ui';
import { IconArrowLeft, IconStar, IconStarStroked, IconEditStroked, IconShareStroked } from '@douyinfe/semi-icons';
import { ElevationChart, type ChartMarkerPoint } from '../components/ElevationChart';
import { getTrailById, findMaxElevationIndex, calculateElevationStats } from '../utils/trails';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { addHistory } from '../utils/history';
import { getNote, setNote } from '../utils/notes';
import { copyToClipboard } from '../utils/clipboard';

const { Title, Paragraph, Text } = Typography;

/**
 * 路线详情页
 */
export function TrailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trail = id ? getTrailById(id) : undefined;
  const [favorited, setFavorited] = useState(false);
  const [note, setNoteState] = useState('');
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (id) {
      setFavorited(isFavorite(id));
      setNoteState(getNote(id));
      if (trail) {
        addHistory(id, trail.name);
      }
    }
  }, [id, trail]);

  const handleNoteChange = (value: string) => {
    setNoteState(value);
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      if (id) {
        setNote(id, value);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleToggleFavorite = () => {
    if (!id) return;
    const newStatus = toggleFavorite(id);
    setFavorited(newStatus);
    Toast.success(newStatus ? '已添加到收藏' : '已取消收藏');
  };

  const handleShare = async () => {
    if (!trail) return;
    const shareText = `${trail.name}\n${window.location.href}`;
    const success = await copyToClipboard(shareText);
    if (success) {
      Toast.success('分享链接已复制到剪贴板');
    } else {
      Toast.error('复制失败，请手动复制');
    }
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

  const elevationStats = calculateElevationStats(trail.elevationProfile);
  const elevationValue = elevationStats.isValid ? (v: number) => `${v} m` : () => '—';

  const descriptionData = [
    { key: '名称', value: trail.name },
    { key: '区域', value: trail.region },
    { key: '总里程', value: `${trail.distance.toFixed(1)} km` },
    { key: '累计爬升', value: `${trail.elevationGain} m` },
    { key: '预计耗时', value: trail.duration },
    { key: '难度', value: trail.difficulty },
    { key: '采样点数', value: `${trail.elevationProfile.length} 个` },
    { key: '最高海拔', value: elevationValue(elevationStats.maxElevation) },
    { key: '最低海拔', value: elevationValue(elevationStats.minElevation) },
    { key: '海拔落差', value: elevationValue(elevationStats.elevationDrop) },
  ];

  const profile = trail.elevationProfile;
  const maxIndex = findMaxElevationIndex(profile);

  const chartMarkers: ChartMarkerPoint[] = [];

  if (profile.length > 0) {
    chartMarkers.push({
      index: 0,
      label: '起点',
      color: '#52c41a',
    });

    if (maxIndex >= 0 && maxIndex !== 0 && maxIndex !== profile.length - 1) {
      chartMarkers.push({
        index: maxIndex,
        label: '最高点',
        color: '#f5222d',
      });
    }

    if (profile.length > 1) {
      chartMarkers.push({
        index: profile.length - 1,
        label: '终点',
        color: '#1890ff',
      });
    }

    if (profile.length === 1) {
      chartMarkers[0].label = '起终点';
    }
  }

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
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<IconShareStroked />}
              theme="borderless"
              onClick={handleShare}
            >
              分享
            </Button>
            <Button
              icon={favorited ? <IconStar style={{ color: '#FFC107' }} /> : <IconStarStroked />}
              theme={favorited ? 'solid' : 'borderless'}
              onClick={handleToggleFavorite}
            >
              {favorited ? '已收藏' : '收藏'}
            </Button>
          </div>
        </div>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          {trail.description}
        </Paragraph>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IconEditStroked style={{ color: '#1890ff' }} />
            <Text strong>个人备注</Text>
            {note.trim().length > 0 && (
              <Text type="tertiary" size="small">（已自动保存）</Text>
            )}
          </div>
          <TextArea
            placeholder="记录你对这条路线的想法、注意事项或个人经验..."
            value={note}
            onChange={handleNoteChange}
            rows={4}
            autosize={{ minRows: 4, maxRows: 10 }}
            showClear
            style={{ width: '100%' }}
          />
        </div>
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
