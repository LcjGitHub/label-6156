import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Typography, Empty, Space, Tag } from '@douyinfe/semi-ui';
import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag/interface';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { MiniElevationChart } from '../components/MiniElevationChart';
import { getTrailById } from '../utils/trails';
import type { Trail } from '../types/trail';

const { Title, Paragraph, Text } = Typography;

const COLORS = {
  left: '#3370ff',
  right: '#f5222d',
};

function getDifficultyColor(difficulty: string): TagColor {
  const colorMap: Record<string, TagColor> = {
    '简单': 'green',
    '中等': 'blue',
    '中等偏难': 'orange',
    '困难': 'red',
    '极难': 'purple',
  };
  return colorMap[difficulty] || 'default';
}

function TrailCard({ trail, color }: { trail: Trail; color: string }) {
  const descriptionData = [
    { key: '总里程', value: `${trail.distance.toFixed(1)} km` },
    { key: '累计爬升', value: `${trail.elevationGain} m` },
    { key: '难度', value: <Tag color={getDifficultyColor(trail.difficulty)} size="large">{trail.difficulty}</Tag> },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
        <Title heading={4} style={{ margin: 0, color }}>
          {trail.name}
        </Title>
      </div>
      <Paragraph type="secondary" style={{ marginBottom: 20, minHeight: 48 }}>
        {trail.description}
      </Paragraph>
      <Descriptions
        data={descriptionData}
        row
        size="small"
        style={{ marginBottom: 20 }}
      />
      <div style={{ marginTop: 'auto' }}>
        <Text type="tertiary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          海拔剖面
        </Text>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 6, padding: 8 }}>
          <MiniElevationChart data={trail.elevationProfile} color={color} height={140} />
        </div>
      </div>
    </div>
  );
}

export function TrailCompare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const idsParam = searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];

  const trail1 = ids.length >= 1 ? getTrailById(ids[0]) : undefined;
  const trail2 = ids.length >= 2 ? getTrailById(ids[1]) : undefined;

  const hasBothTrails = trail1 && trail2;

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

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title heading={3} style={{ margin: 0 }}>
            路线对比
          </Title>
          {hasBothTrails && (
            <Space>
              <Space>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.left }} />
                <Text type="secondary">{trail1.name}</Text>
              </Space>
              <Text type="tertiary">VS</Text>
              <Space>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.right }} />
                <Text type="secondary">{trail2.name}</Text>
              </Space>
            </Space>
          )}
        </div>

        {!hasBothTrails ? (
          <Empty
            title="请选择两条路线进行对比"
            description="返回列表，勾选恰好两条路线后点击对比按钮"
            style={{ padding: '60px 0' }}
          />
        ) : (
          <div style={{ display: 'flex', gap: 32 }}>
            <TrailCard trail={trail1} color={COLORS.left} />
            <div
              style={{
                width: 1,
                backgroundColor: 'rgba(0,0,0,0.08)',
              }}
            />
            <TrailCard trail={trail2} color={COLORS.right} />
          </div>
        )}
      </Card>
    </div>
  );
}
