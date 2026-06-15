import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button } from '@douyinfe/semi-ui';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { calculateTrailStats } from '../utils/statsCalc';

const { Title, Text } = Typography;

const cardStyles: Record<string, React.CSSProperties> = {
  root: {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
  },
};

export function TrailStats() {
  const navigate = useNavigate();
  const stats = calculateTrailStats();

  const statCards = [
    {
      label: '路线总条数',
      value: `${stats.totalCount}`,
      unit: '条',
      color: '#3370ff',
    },
    {
      label: '总里程合计',
      value: stats.totalDistance.toFixed(1),
      unit: 'km',
      color: '#00b578',
    },
    {
      label: '平均爬升',
      value: stats.avgElevationGain.toFixed(0),
      unit: 'm',
      color: '#ff8f1f',
    },
    {
      label: '爬升最高路线',
      value: stats.maxElevationGainTrail
        ? `${stats.maxElevationGainTrail.name}`
        : '—',
      unit: stats.maxElevationGainTrail
        ? `${stats.maxElevationGainTrail.value} m`
        : '',
      color: '#f82c55',
      isHighlight: true,
    },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <Button
          icon={<IconArrowLeft />}
          onClick={() => navigate('/')}
        />
        <Title heading={3} style={{ margin: 0 }}>
          数据统计
        </Title>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {statCards.map((card) => (
          <Card
            key={card.label}
            style={cardStyles.root}
            bodyStyle={cardStyles.body}
          >
            <Text type="tertiary" style={{ fontSize: 14, marginBottom: 12 }}>
              {card.label}
            </Text>
            <Text
              strong
              style={{
                fontSize: card.isHighlight ? 22 : 36,
                color: card.color,
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              {card.value}
            </Text>
            {card.unit && (
              <Text
                type="secondary"
                style={{
                  fontSize: card.isHighlight ? 16 : 18,
                  marginTop: 4,
                  color: card.isHighlight ? card.color : undefined,
                }}
              >
                {card.unit}
              </Text>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
