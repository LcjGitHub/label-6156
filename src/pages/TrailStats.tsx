import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button } from '@douyinfe/semi-ui';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { calculateTrailStats, countTrailsByDifficulty } from '../utils/statsCalc';
import { DifficultyBarChart } from '../components/DifficultyBarChart';

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

interface StatCardConfig {
  label: string;
  value: string;
  unit: string;
  color: string;
  isHighlight?: boolean;
  regionLabel: string;
  valueLabel: string;
}

/**
 * 路线数据统计页
 *
 * 以卡片形式展示全部路线的统计汇总数据，包括：
 * - 路线总条数
 * - 总里程合计
 * - 平均爬升
 * - 爬升最高的路线名称与数值
 */
export function TrailStats() {
  const navigate = useNavigate();
  const stats = calculateTrailStats();
  const difficultyData = countTrailsByDifficulty();

  const statCards: StatCardConfig[] = [
    {
      label: '路线总条数',
      value: `${stats.totalCount}`,
      unit: '条',
      color: '#3370ff',
      regionLabel: '路线总条数统计区域',
      valueLabel: `路线总条数 ${stats.totalCount} 条`,
    },
    {
      label: '总里程合计',
      value: stats.totalDistance.toFixed(1),
      unit: 'km',
      color: '#00b578',
      regionLabel: '总里程合计统计区域',
      valueLabel: `总里程合计 ${stats.totalDistance.toFixed(1)} 公里`,
    },
    {
      label: '平均爬升',
      value: stats.avgElevationGain.toFixed(0),
      unit: 'm',
      color: '#ff8f1f',
      regionLabel: '平均爬升统计区域',
      valueLabel: `平均爬升 ${stats.avgElevationGain.toFixed(0)} 米`,
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
      regionLabel: '爬升最高路线统计区域',
      valueLabel: stats.maxElevationGainTrail
        ? `爬升最高路线 ${stats.maxElevationGainTrail.name}，爬升 ${stats.maxElevationGainTrail.value} 米`
        : '爬升最高路线暂无数据',
    },
  ];

  return (
    <div className="page-container">
      <Button
        icon={<IconArrowLeft />}
        theme="borderless"
        onClick={() => navigate('/')}
        style={{ marginBottom: 16 }}
        aria-label="返回徒步路线列表页"
      >
        返回列表
      </Button>

      <Card>
        <Title heading={3} style={{ margin: 0, marginBottom: 24 }}>
          数据统计
        </Title>

        <div
          role="region"
          aria-label="路线统计数据卡片列表"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              role="region"
              aria-label={card.regionLabel}
            >
              <Card
                style={cardStyles.root}
                bodyStyle={cardStyles.body}
              >
                <Text
                  type="tertiary"
                  style={{ fontSize: 14, marginBottom: 12 }}
                  role="img"
                  aria-label={card.label}
                >
                  {card.label}
                </Text>
                <Text
                  strong
                  role="text"
                  aria-label={card.valueLabel}
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
                    aria-hidden={card.isHighlight ? 'false' : 'true'}
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
            </div>
          ))}
        </div>

        <Title heading={4} style={{ margin: 0, marginTop: 32, marginBottom: 16 }}>
          难度分布
        </Title>
        <div role="region" aria-label="难度分布统计区域">
          <DifficultyBarChart data={difficultyData} />
        </div>
      </Card>
    </div>
  );
}
