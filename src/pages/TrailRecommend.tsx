import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Select, InputNumber, Button, Space, Empty, Tag } from '@douyinfe/semi-ui';
import type { TagProps } from '@douyinfe/semi-ui/lib/es/tag/interface';
import { IconStar, IconArrowUp, IconBulb, IconRoute } from '@douyinfe/semi-icons';
import type { Trail } from '../types/trail';
import { getAllTrails, getAllDifficulties, recommendTrails, type RecommendFilter } from '../utils/trails';
import { getFavoriteIds } from '../utils/favorites';

const { Title, Text } = Typography;

const difficultyColorMap: Record<string, TagProps['color']> = {
  '简单': 'green',
  '中等': 'blue',
  '中等偏难': 'orange',
  '困难': 'red',
  '极难': 'violet',
};

export function TrailRecommend() {
  const navigate = useNavigate();
  const trails = getAllTrails();
  const difficulties = getAllDifficulties();

  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [minDistance, setMinDistance] = useState<number | undefined>(undefined);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [searched, setSearched] = useState(false);

  const results = useMemo(() => {
    if (!searched) return [];
    const filter: RecommendFilter = { difficulty, minDistance, maxDistance };
    const favoriteIds = getFavoriteIds();
    return recommendTrails(trails, filter, favoriteIds);
  }, [searched, difficulty, minDistance, maxDistance, trails]);

  const handleRecommend = () => {
    setSearched(true);
  };

  const handleReset = () => {
    setDifficulty(undefined);
    setMinDistance(undefined);
    setMaxDistance(undefined);
    setSearched(false);
  };

  return (
    <div className="page-container">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Title heading={3} style={{ margin: 0 }}>
            路线智能推荐
          </Title>
          <Link
            to="/"
            style={{
              fontSize: 14,
              whiteSpace: 'nowrap',
              color: 'var(--semi-color-link)',
              textDecoration: 'none',
            }}
          >
            返回列表
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 16,
            marginBottom: 24,
            padding: 20,
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 8,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text strong style={{ fontSize: 13 }}>期望难度</Text>
            <Select
              placeholder="选择难度"
              style={{ width: 160 }}
              value={difficulty}
              onChange={(value) => setDifficulty(value as string | undefined)}
              optionList={[
                { value: '', label: '不限难度' },
                ...difficulties.map((d) => ({ value: d, label: d })),
              ]}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text strong style={{ fontSize: 13 }}>最小里程 (km)</Text>
            <InputNumber
              min={0}
              placeholder="不限"
              style={{ width: 140 }}
              value={minDistance}
              onChange={(value) => setMinDistance(value as number | undefined)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text strong style={{ fontSize: 13 }}>最大里程 (km)</Text>
            <InputNumber
              min={0}
              placeholder="不限"
              style={{ width: 140 }}
              value={maxDistance}
              onChange={(value) => setMaxDistance(value as number | undefined)}
            />
          </div>

          <Space style={{ marginLeft: 'auto' }}>
            <Button onClick={handleReset}>重置</Button>
            <Button type="primary" theme="solid" icon={<IconBulb />} onClick={handleRecommend}>
              智能推荐
            </Button>
          </Space>
        </div>

        {!searched && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <IconStar style={{ fontSize: 48, color: 'rgba(0,0,0,0.15)' }} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 15 }}>
                选择期望难度和里程范围，点击「智能推荐」获取适合你的路线
              </Text>
            </div>
          </div>
        )}

        {searched && results.length === 0 && (
          <Empty
            title="没有符合条件的推荐路线"
            description="所有符合筛选条件的路线都已被收藏，请调整条件后再试"
            style={{ padding: '40px 0' }}
          />
        )}

        {searched && results.length > 0 && (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              为你推荐 <Text strong style={{ color: '#3370ff' }}>{results.length}</Text> 条未收藏路线，按爬升从低到高排列
            </Text>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {results.map((trail: Trail) => (
                <div
                  key={trail.id}
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                  onClick={() => navigate(`/trail/${trail.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/trail/${trail.id}`); } }}
                >
                  <Card style={{ border: '1px solid var(--semi-color-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>{trail.name}</Text>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Tag color={difficultyColorMap[trail.difficulty] || 'blue'} size="small">
                        {trail.difficulty}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconRoute style={{ fontSize: 14, color: 'var(--semi-color-text-2)' }} />
                        <Text type="tertiary" style={{ fontSize: 13 }}>{trail.distance.toFixed(1)} km</Text>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconArrowUp style={{ fontSize: 14, color: 'var(--semi-color-text-2)' }} />
                        <Text type="tertiary" style={{ fontSize: 13 }}>{trail.elevationGain} m</Text>
                      </span>
                    </div>
                  </div>
                  </Card>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
